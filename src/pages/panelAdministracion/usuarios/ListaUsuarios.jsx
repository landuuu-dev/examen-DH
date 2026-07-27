import React, { useState, useEffect } from "react";

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioActual, setUsuarioActual] = useState(null);

  const BACKEND_URL = "https://backend-examen-dh.onrender.com";

  // 🔑 Función auxiliar para obtener el token sin importar cómo esté guardado
  const obtenerToken = () => {
    const tokenDirecto =
      localStorage.getItem("token") || localStorage.getItem("jwt");
    if (tokenDirecto) return tokenDirecto;

    const usuarioStorage = localStorage.getItem("usuario");
    if (usuarioStorage) {
      try {
        const parsed = JSON.parse(usuarioStorage);
        return parsed.token || parsed.jwt || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const usuarioStorage = localStorage.getItem("usuario");
    if (usuarioStorage) {
      try {
        setUsuarioActual(JSON.parse(usuarioStorage));
      } catch (err) {
        console.error("Error al parsear el usuario guardado:", err);
      }
    }

    obtenerUsuarios();
  }, []);

  const esSuperAdmin =
    usuarioActual?.rol === "SUPER_ADMIN" ||
    usuarioActual?.rol === "ROLE_SUPER_ADMIN" ||
    usuarioActual?.role === "SUPER_ADMIN" ||
    usuarioActual?.role === "ROLE_SUPER_ADMIN" ||
    usuarioActual?.esSuperAdmin === true;

  const obtenerUsuarios = async () => {
    setCargando(true);
    setError(null);
    try {
      const token = obtenerToken();

      if (!token) {
        setError(
          "No se encontró una sesión activa (token no presente). Por favor inicia sesión.",
        );
        setCargando(false);
        return;
      }

      const res = await fetch(`${BACKEND_URL}/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo obtener la lista de usuarios");
      }

      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarUsuario = async (id, correo) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar al usuario: ${correo}?`,
    );
    if (!confirmar) return;

    try {
      const token = obtenerToken();

      if (!token) {
        alert("Error: Sesión no encontrada. Vuelve a iniciar sesión.");
        return;
      }

      const res = await fetch(`${BACKEND_URL}/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
        alert("Usuario eliminado con éxito.");
      } else if (res.status === 403) {
        alert(
          "Error 403: No tienes permisos suficientes de Administrador o tu token expiró.",
        );
      } else {
        alert(`No se pudo eliminar el usuario. Estado: ${res.status}`);
      }
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("Error de conexión al intentar eliminar.");
    }
  };

  const handleNombrarAdmin = async (usuario) => {
    if (!esSuperAdmin) {
      alert("Solo el Super Admin tiene permisos para asignar administradores.");
      return;
    }

    const correo = usuario.email || usuario.correo || usuario.nombreUsuario;
    const confirmar = window.confirm(
      `¿Deseas nombrar administrador a ${correo}?`,
    );
    if (!confirmar) return;

    try {
      const token = obtenerToken();

      // 🎯 Apuntamos directamente al endpoint /admin/promote/{id} que creamos en Spring
      const res = await fetch(`${BACKEND_URL}/admin/promote/${usuario.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuario.id ? { ...u, rol: "ADMIN", role: "ADMIN" } : u,
          ),
        );
        alert("El usuario ahora es Administrador.");
      } else if (res.status === 403) {
        alert(
          "Error 403: Solo un usuario con rol SUPER_ADMIN puede realizar esta acción.",
        );
      } else {
        alert(`No se pudo cambiar el rol. Código de estado: ${res.status}`);
      }
    } catch (err) {
      console.error("Error al asignar rol de administrador:", err);
      alert("Error de conexión al cambiar el rol.");
    }
  };

  const administradores = usuarios.filter(
    (u) =>
      u.rol === "ADMIN" ||
      u.rol === "ROLE_ADMIN" ||
      u.rol === "SUPER_ADMIN" ||
      u.rol === "ROLE_SUPER_ADMIN" ||
      u.role === "ADMIN" ||
      u.role === "SUPER_ADMIN",
  );

  const renderFilaUsuario = (u) => {
    const correo = u.email || u.correo || u.nombreUsuario || "Sin correo";
    const rolActual = u.rol || u.role || "USUARIO";
    const esAdmin =
      rolActual === "ADMIN" ||
      rolActual === "ROLE_ADMIN" ||
      rolActual === "SUPER_ADMIN" ||
      rolActual === "ROLE_SUPER_ADMIN";

    return (
      <div
        key={u.id}
        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-100 transition duration-150 gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
            {correo.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {correo}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  esAdmin
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {rolActual}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: #{String(u.id).slice(-4)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          {esSuperAdmin && !esAdmin && (
            <button
              onClick={() => handleNombrarAdmin(u)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 text-xs font-semibold rounded-lg transition duration-150 flex items-center gap-1 cursor-pointer"
            >
              <span>⭐</span> Nombrar Admin
            </button>
          )}

          {u.id !== usuarioActual?.id &&
            rolActual !== "SUPER_ADMIN" &&
            rolActual !== "ROLE_SUPER_ADMIN" && (
              <button
                onClick={() => handleEliminarUsuario(u.id, correo)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-semibold rounded-lg transition duration-150 flex items-center gap-1 cursor-pointer"
              >
                <span>🗑️</span> Eliminar
              </button>
            )}
        </div>
      </div>
    );
  };

  if (cargando) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Cargando lista de usuarios...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center text-sm font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
      {/* SECCIÓN 1: Administradores */}
      <section className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🛡️</span>
          <h2 className="text-lg font-bold text-slate-900">
            Administradores ({administradores.length})
          </h2>
        </div>

        {administradores.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            No hay administradores registrados.
          </p>
        ) : (
          <div className="space-y-2.5">
            {administradores.map((u) => renderFilaUsuario(u))}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: Todos los Usuarios */}
      <section className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">👥</span>
          <h2 className="text-lg font-bold text-slate-900">
            Todos los Usuarios ({usuarios.length})
          </h2>
        </div>

        {usuarios.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            No hay usuarios registrados.
          </p>
        ) : (
          <div className="space-y-2.5">
            {usuarios.map((u) => renderFilaUsuario(u))}
          </div>
        )}
      </section>
    </div>
  );
}
