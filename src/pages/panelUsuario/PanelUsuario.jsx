import React, { useState, useEffect } from "react";

export default function PanelUsuario() {
  const [usuario] = useState(() => {
    try {
      const u = localStorage.getItem("usuario");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [token] = useState(() => localStorage.getItem("token") || "");
  const [misFavoritos, setMisFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const BACKEND_URL = "https://backend-examen-dh.onrender.com";
  const userId = usuario?.id || usuario?._id || usuario?.idUsuario;

  useEffect(() => {
    if (!token || !userId) {
      setCargando(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        setErrorMsg(null);
        setCargando(true);

        const response = await fetch(
          `${BACKEND_URL}/usuarios/${userId}/favoritos`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Error en el servidor (${response.status})`);
        }

        const data = await response.json();
        setMisFavoritos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar favoritos:", err);
        setErrorMsg(err.message || "No se pudieron cargar tus favoritos.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [userId, token]);

  const handleQuitarFavorito = async (tourId) => {
    if (!token || !userId) return;

    // Actualización optimista de UI
    setMisFavoritos((prev) => prev.filter((t) => (t.id || t._id) !== tourId));

    try {
      await fetch(`${BACKEND_URL}/usuarios/${userId}/favoritos/${tourId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Error al eliminar favorito en el backend:", err);
    }
  };

  if (!token || !usuario) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-md shadow-sm">
          <h2 className="text-2xl font-bold text-amber-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-amber-700">
            Por favor, inicia sesión para acceder a tu panel de usuario.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cabecera del Perfil */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
          {usuario?.correo ? usuario.correo.charAt(0).toUpperCase() : "U"}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">Mi Cuenta</h2>
          <p className="text-slate-600 text-sm">
            <strong className="font-semibold text-slate-700">Correo:</strong>{" "}
            {usuario?.correo}
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
              {usuario?.rol || "USER"}
            </span>
          </div>
        </div>
      </section>

      <hr className="my-8 border-slate-200/80" />

      {/* Listado de Favoritos */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">
            Mis Tours Favoritos
          </h3>
          {!cargando && !errorMsg && (
            <span className="text-sm font-medium text-slate-500">
              {misFavoritos.length}{" "}
              {misFavoritos.length === 1 ? "guardado" : "guardados"}
            </span>
          )}
        </div>

        {cargando && (
          <div className="flex justify-center items-center py-12">
            <p className="animate-pulse text-indigo-600 font-medium flex items-center gap-2">
              <span className="text-xl">⏳</span> Cargando tus favoritos...
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm">
            <p className="font-medium">Ocurrió un problema: {errorMsg}</p>
          </div>
        )}

        {!cargando && !errorMsg && misFavoritos.length === 0 && (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <span className="text-4xl mb-3 block">💔</span>
            <p className="text-slate-600 font-medium">
              Aún no has guardado ningún tour en tus favoritos.
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Explora nuestro catálogo y guarda los que más te gusten.
            </p>
          </div>
        )}

        {!cargando && misFavoritos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {misFavoritos.map((tour) => {
              const tourId = tour?.id || tour?._id;
              if (!tourId) return null;

              const imagenUrl =
                tour.imagenes?.[0] ||
                tour.categoria?.imagenes?.[0] ||
                "https://via.placeholder.com/300x200?text=Sin+Imagen";

              return (
                <div
                  key={tourId}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                >
                  {/* Imagen y Badge */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={imagenUrl}
                      alt={tour.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {tour.categoria?.nombre && (
                      <span className="absolute top-3 left-3 bg-slate-900/75 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                        {tour.categoria.nombre}
                      </span>
                    )}
                  </div>

                  {/* Cuerpo de la Card */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 text-lg leading-snug line-clamp-1">
                        {tour.nombre}
                      </h4>
                      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                        {tour.descripcion}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 pt-1">
                        📍 <span className="capitalize">{tour.ubicacion}</span>
                      </p>
                    </div>

                    {/* Footer de la Card */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">
                          Precio
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          ${tour.precio} USD
                        </span>
                      </div>

                      <button
                        onClick={() => handleQuitarFavorito(tourId)}
                        className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-2 rounded-xl transition-colors duration-150 active:scale-95"
                        title="Quitar de favoritos"
                      >
                        <span>❤️</span> Quitar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
