import React, { useEffect, useState } from "react";
import HeaderAdmin from "./HeaderAdmin";
// ⚠️ Asegúrate de ajustar esta ruta según dónde guardaste ErrorPanel
import ErrorPanel from "../../componentesEstaticos/ErrorPanel";

function PanelAdmin() {
  const [esAutorizado, setEsAutorizado] = useState(false);
  const [esMovil, setEsMovil] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Detección de dispositivo móvil / tamaño de pantalla
    const verificarTamanoPantalla = () => {
      // Pantallas menores a 768px (móviles/tablets verticales)
      const esPantallaPequena = window.innerWidth < 768;
      const esDispositivoMovil = /Mobi|Android|iPhone|iPad/i.test(
        navigator.userAgent,
      );

      setEsMovil(esPantallaPequena || esDispositivoMovil);
    };

    verificarTamanoPantalla();
    window.addEventListener("resize", verificarTamanoPantalla);

    // 2. Verificación de permisos del usuario desde localStorage
    const usuarioStorage = localStorage.getItem("usuario");

    if (usuarioStorage) {
      try {
        const usuario = JSON.parse(usuarioStorage);
        const rol = usuario?.rol || usuario?.role || "";

        const tienePermisos =
          rol === "ADMIN" ||
          rol === "SUPER_ADMIN" ||
          rol === "ROLE_ADMIN" ||
          rol === "ROLE_SUPER_ADMIN" ||
          usuario?.esSuperAdmin === true;

        if (tienePermisos) {
          setEsAutorizado(true);
        }
      } catch (error) {
        console.error("Error al validar la sesión del usuario:", error);
      }
    }

    setCargando(false);

    return () => {
      window.removeEventListener("resize", verificarTamanoPantalla);
    };
  }, []);

  // Loader mientas revisa pantalla y permisos
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium text-sm">
        Verificando credenciales de acceso...
      </div>
    );
  }

  // 🎯 1. Bloqueo por dispositivo móvil
  if (esMovil) {
    return <ErrorPanel tipo="movil" />;
  }

  // 🎯 2. Bloqueo por falta de permisos (o usuario no logueado)
  if (!esAutorizado) {
    return <ErrorPanel tipo="permisos" />;
  }

  // 🚀 3. Vista principal si pasa todos los controles
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 mt-16">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado del Panel */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Gestiona el catálogo de tours, categorías y usuarios del sistema.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Modo Administrador
            </span>
          </div>
        </header>

        {/* Contenedor de Navegación / Contenido Admin */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <HeaderAdmin />
        </section>
      </div>
    </div>
  );
}

export default PanelAdmin;
