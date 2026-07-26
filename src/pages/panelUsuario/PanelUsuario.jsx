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
  const [toursInscritos, setToursInscritos] = useState([]);
  const [misInscripcionesIds, setMisInscripcionesIds] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoTourId, setProcesandoTourId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const BACKEND_URL = "https://backend-examen-dh.onrender.com";
  const userId = usuario?.id || usuario?._id || usuario?.idUsuario;

  const getImagenUrl = (img) => {
    if (!img) return "https://via.placeholder.com/300x200?text=Sin+Imagen";

    if (typeof img === "string") {
      if (img.startsWith("http://") || img.startsWith("https://")) {
        return img;
      }
      return `${BACKEND_URL}${img.startsWith("/") ? "" : "/"}${img}`;
    }

    if (typeof img === "object" && img.url) {
      if (img.url.startsWith("http://") || img.url.startsWith("https://")) {
        return img.url;
      }
      return `${BACKEND_URL}${img.url.startsWith("/") ? "" : "/"}${img.url}`;
    }

    return "https://via.placeholder.com/300x200?text=Sin+Imagen";
  };

  useEffect(() => {
    if (!token || !userId) {
      setCargando(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        setErrorMsg(null);
        setCargando(true);

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // 1. Peticiones iniciales: Favoritos, Mis Inscripciones y Catálogo de Tours
        const [resFavs, resInsc, resTodosTours] = await Promise.all([
          fetch(`${BACKEND_URL}/usuarios/${userId}/favoritos`, { headers }),
          fetch(`${BACKEND_URL}/usuarios/${userId}/mis-inscripciones`, {
            headers,
          }),
          fetch(`${BACKEND_URL}/tours`, { headers }),
        ]);

        if (!resFavs.ok) throw new Error("Error al cargar favoritos.");

        // Procesar Favoritos
        const dataFavs = await resFavs.json();
        setMisFavoritos(Array.isArray(dataFavs) ? dataFavs : []);

        // Obtener la lista general de tours para cruzar la información
        let todosLosTours = [];
        if (resTodosTours.ok) {
          todosLosTours = await resTodosTours.json();
        }

        // Procesar Inscripciones
        if (resInsc.ok) {
          const dataInsc = await resInsc.json();
          console.log("📦 DATOS CRUDOS DE INSCRIPCIONES:", dataInsc);

          if (Array.isArray(dataInsc)) {
            const ids = dataInsc.map(
              (item) => item.tourId || item.idTour || item.id,
            );
            setMisInscripcionesIds(ids.filter(Boolean));

            // Cruzamos los IDs con la lista completa de tours para obtener precio, foto, etc.
            const toursCompletosInscritos = dataInsc.map((inscripcion) => {
              const targetId = inscripcion.tourId || inscripcion.idTour;
              const tourEncontrado = todosLosTours.find(
                (t) => (t.id || t._id) === targetId,
              );

              // Si encontramos el tour en el catálogo, lo usamos.
              // Si no, hacemos un respaldo con lo que vino en la inscripción.
              return (
                tourEncontrado || {
                  id: targetId || inscripcion.id,
                  nombre: inscripcion.nombreTour || "Tour sin título",
                  descripcion: "Inscripción confirmada",
                  precio: 0,
                  ubicacion: "General",
                  imagenes: [],
                }
              );
            });

            setToursInscritos(toursCompletosInscritos);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setErrorMsg(err.message || "No se pudieron cargar tus datos.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [userId, token]);

  const handleQuitarFavorito = async (tourId) => {
    if (!token || !userId) return;

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
      console.error("Error al eliminar favorito:", err);
    }
  };

  const handleToggleInscripcion = async (tour) => {
    if (!token) return;

    const tourId = tour?.id || tour?._id;
    if (!tourId) return;

    const estaInscrito = misInscripcionesIds.includes(tourId);
    setProcesandoTourId(tourId);

    try {
      const url = estaInscrito
        ? `${BACKEND_URL}/tours/${tourId}/desinscribirse`
        : `${BACKEND_URL}/tours/${tourId}/inscribir`;

      const method = estaInscrito ? "DELETE" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo procesar la inscripción.");
      }

      if (estaInscrito) {
        setMisInscripcionesIds((prev) => prev.filter((id) => id !== tourId));
        setToursInscritos((prev) =>
          prev.filter((t) => (t.id || t._id) !== tourId),
        );
      } else {
        setMisInscripcionesIds((prev) => [...prev, tourId]);
        setToursInscritos((prev) => [...prev, tour]);
      }
    } catch (err) {
      console.error("Error en la inscripción:", err);
      alert(err.message || "Ocurrió un error al procesar tu solicitud.");
    } finally {
      setProcesandoTourId(null);
    }
  };

  if (!token || !usuario) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-md shadow-xs">
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-indigo-700 text-white font-bold text-3xl flex items-center justify-center shadow-xs shrink-0">
          {usuario?.correo ? usuario.correo.charAt(0).toUpperCase() : "U"}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Mi Cuenta</h2>
          <p className="text-slate-700 text-sm">
            <strong className="font-semibold text-slate-900">Correo:</strong>{" "}
            {usuario?.correo}
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase tracking-wider">
              {usuario?.rol || "USER"}
            </span>
          </div>
        </div>
      </section>

      {/* SECCIÓN 1: MIS TOURS INSCRITOS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            🎟️ Mis Tours Inscritos
          </h3>
          {!cargando && !errorMsg && (
            <span className="text-sm font-semibold text-slate-600 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              {toursInscritos.length}{" "}
              {toursInscritos.length === 1
                ? "inscripción activa"
                : "inscripciones activas"}
            </span>
          )}
        </div>

        {cargando && (
          <div className="flex justify-center items-center py-8">
            <p className="animate-pulse text-indigo-700 font-bold flex items-center gap-2">
              <span>⏳</span> Cargando tus inscripciones...
            </p>
          </div>
        )}

        {!cargando && !errorMsg && toursInscritos.length === 0 && (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
            <span className="text-4xl mb-2 block">🎫</span>
            <p className="text-slate-700 font-bold">
              No estás inscrito en ningún tour por el momento.
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Revisa nuestras recomendaciones e inscríbete a tu próxima
              aventura.
            </p>
          </div>
        )}

        {!cargando && toursInscritos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {toursInscritos.map((tour, index) => {
              const tourId = tour?.id || tour?._id || index;

              const nombre = tour.nombre || tour.titulo || "Tour sin título";
              const descripcion =
                tour.descripcion || "Sin descripción disponible.";
              const precio = tour.precio ?? 0;
              const ubicacion = tour.ubicacion || tour.destino || "General";

              const imagenesList = Array.isArray(tour.imagenes)
                ? tour.imagenes
                : typeof tour.imagenes === "string"
                  ? [tour.imagenes]
                  : [];
              const imagenFinal = getImagenUrl(imagenesList[0]);
              const procesando = procesandoTourId === tourId;

              return (
                <div
                  key={`inscrito-${tourId}-${index}`}
                  className="bg-white rounded-2xl border border-emerald-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={imagenFinal}
                      alt={nombre}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                      ✓ Inscripto
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-lg line-clamp-1">
                        {nombre}
                      </h4>
                      <p className="text-slate-600 text-sm line-clamp-2">
                        {descripcion}
                      </p>
                      <p className="text-xs font-bold text-slate-500 pt-1">
                        📍 {ubicacion}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-lg font-bold text-indigo-600">
                        ${precio} USD
                      </span>

                      <button
                        onClick={() => handleToggleInscripcion(tour)}
                        disabled={procesando}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50"
                      >
                        {procesando ? "Procesando..." : "Cancelar inscripción"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: MIS TOURS FAVORITOS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            ❤️ Mis Tours Favoritos
          </h3>
          {!cargando && !errorMsg && (
            <span className="text-sm font-semibold text-slate-600 bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
              {misFavoritos.length}{" "}
              {misFavoritos.length === 1 ? "guardado" : "guardados"}
            </span>
          )}
        </div>

        {cargando && (
          <div className="flex justify-center items-center py-8">
            <p className="animate-pulse text-indigo-700 font-bold flex items-center gap-2">
              <span>⏳</span> Cargando tus favoritos...
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-medium">
            <p>Ocurrió un problema: {errorMsg}</p>
          </div>
        )}

        {!cargando && !errorMsg && misFavoritos.length === 0 && (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
            <span className="text-4xl mb-2 block">💔</span>
            <p className="text-slate-700 font-bold">
              Aún no has guardado ningún tour en tus favoritos.
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Explora nuestro catálogo y guarda los que más te gusten.
            </p>
          </div>
        )}

        {!cargando && misFavoritos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {misFavoritos.map((tour, index) => {
              const tourId = tour?.id || tour?._id || index;
              const estaInscrito = misInscripcionesIds.includes(tourId);
              const procesando = procesandoTourId === tourId;

              const nombre = tour.nombre || tour.titulo || "Tour sin título";
              const descripcion =
                tour.descripcion || "Sin descripción disponible.";
              const precio = tour.precio ?? 0;
              const ubicacion = tour.ubicacion || tour.destino || "General";

              const imagenesList = Array.isArray(tour.imagenes)
                ? tour.imagenes
                : typeof tour.imagenes === "string"
                  ? [tour.imagenes]
                  : [];
              const imagenFinal = getImagenUrl(imagenesList[0]);

              return (
                <div
                  key={`favorito-${tourId}-${index}`}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={imagenFinal}
                      alt={nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {tour.categoria?.nombre && (
                      <span className="absolute top-3 left-3 bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        {tour.categoria.nombre}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-lg leading-snug line-clamp-1">
                        {nombre}
                      </h4>
                      <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                        {descripcion}
                      </p>
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-1 pt-1">
                        📍 <span className="capitalize">{ubicacion}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 block font-medium">
                          Precio
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          ${precio} USD
                        </span>
                      </div>

                      <button
                        onClick={() => handleQuitarFavorito(tourId)}
                        className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-2 rounded-xl border border-rose-200 transition duration-150 cursor-pointer active:scale-95"
                        title="Quitar de favoritos"
                      >
                        <span>❤️</span> Quitar
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleInscripcion(tour)}
                      disabled={procesando}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition duration-150 cursor-pointer flex items-center justify-center gap-2 ${
                        estaInscrito
                          ? "bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-300"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      } ${procesando ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {procesando ? (
                        <span>Procesando...</span>
                      ) : estaInscrito ? (
                        <>
                          <span>✓</span> Inscrito (Cancelar)
                        </>
                      ) : (
                        <>
                          <span>🎟️</span> Inscribirme
                        </>
                      )}
                    </button>
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
