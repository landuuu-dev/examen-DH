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

  // Estados para la vista ampliada/detallada del tour
  const [tourSeleccionado, setTourSeleccionado] = useState(null);
  const [verTodasImagenes, setVerTodasImagenes] = useState(false);

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

        // Peticiones iniciales: Favoritos, Mis Inscripciones y Catálogo de Tours
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

          if (Array.isArray(dataInsc)) {
            const ids = dataInsc.map(
              (item) => item.tourId || item.idTour || item.id,
            );
            setMisInscripcionesIds(ids.filter(Boolean));

            // Cruzamos los IDs con la lista completa de tours
            const toursCompletosInscritos = dataInsc.map((inscripcion) => {
              const targetId = inscripcion.tourId || inscripcion.idTour;
              const tourEncontrado = todosLosTours.find(
                (t) => (t.id || t._id) === targetId,
              );

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

  const handleQuitarFavorito = async (e, tourId) => {
    e.stopPropagation(); // Evita que se abra la vista ampliada
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

  const handleToggleInscripcion = async (e, tour) => {
    if (e) e.stopPropagation(); // Evita que se abra la vista ampliada
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

  // === VISTA AMPLIADA / DETALLE DEL TOUR SELECCIONADO ===
  if (tourSeleccionado) {
    const imagenes =
      tourSeleccionado.imagenes || tourSeleccionado.imagenesUrl || [];
    const tourIdActual = tourSeleccionado.id || tourSeleccionado._id;
    const estaInscrito = misInscripcionesIds.includes(tourIdActual);
    const estaProcesando = procesandoTourId === tourIdActual;

    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto mt-6">
        {/* Encabezado y Volver */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-800">
                {tourSeleccionado.nombre || tourSeleccionado.titulo}
              </h2>
              {tourSeleccionado.categoria?.nombre && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                  {tourSeleccionado.categoria.nombre}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-1">
              📍{" "}
              {tourSeleccionado.ubicacion ||
                tourSeleccionado.destino ||
                "Ubicación no especificada"}
            </p>
          </div>

          <button
            onClick={() => {
              setTourSeleccionado(null);
              setVerTodasImagenes(false);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
          >
            ← Volver a Mi Cuenta
          </button>
        </div>

        {/* Descripción, Precio y Botón de Inscripción */}
        <div className="mb-6 bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-600 leading-relaxed md:w-2/3">
            {tourSeleccionado.descripcion || "Sin descripción disponible."}
          </p>

          <div className="flex flex-col items-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
            <div className="text-right">
              <span className="text-sm text-slate-400 block">
                Precio por persona
              </span>
              <span className="text-3xl font-bold text-indigo-600">
                ${tourSeleccionado.precio ?? 0} USD
              </span>
            </div>

            <button
              onClick={(e) => handleToggleInscripcion(e, tourSeleccionado)}
              disabled={estaProcesando}
              className={`w-full md:w-auto px-6 py-3 font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                estaInscrito
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              } disabled:opacity-50`}
            >
              {estaProcesando ? (
                <span>Procesando...</span>
              ) : estaInscrito ? (
                <>
                  <span>✓ Inscrito</span>
                  <span className="text-xs opacity-80">
                    (Cancelar inscripción)
                  </span>
                </>
              ) : (
                <span>🎟️ Inscribirme al tour</span>
              )}
            </button>
          </div>
        </div>

        {/* Galería de Imágenes */}
        {imagenes.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/2">
              <img
                src={getImagenUrl(imagenes[0])}
                alt={tourSeleccionado.nombre}
                className="w-full h-80 md:h-[400px] object-cover rounded-2xl shadow-md"
              />
            </div>

            <div className="md:w-1/2 grid grid-cols-2 gap-2 relative">
              {imagenes.slice(1, 5).map((img, i) => (
                <img
                  key={i}
                  src={getImagenUrl(img)}
                  alt={`${tourSeleccionado.nombre} miniatura ${i + 1}`}
                  className="w-full h-36 md:h-48 object-cover rounded-xl shadow-sm"
                />
              ))}

              {imagenes.length > 5 && (
                <button
                  onClick={() => setVerTodasImagenes(true)}
                  className="col-span-2 py-3 bg-slate-900/80 hover:bg-slate-900 text-white text-center font-semibold rounded-xl transition backdrop-blur-sm cursor-pointer"
                >
                  Ver todas las fotos ({imagenes.length})
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-100 rounded-xl text-slate-400">
            No hay imágenes disponibles para este tour.
          </div>
        )}

        {/* Modal de Galería Modal */}
        {verTodasImagenes && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-5xl my-8 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-xl font-bold text-slate-800">
                  Todas las imágenes ({imagenes.length})
                </h3>
                <button
                  onClick={() => setVerTodasImagenes(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-2xl px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto p-2">
                {imagenes.map((img, i) => (
                  <img
                    key={i}
                    src={getImagenUrl(img)}
                    alt={`${tourSeleccionado.nombre} ${i + 1}`}
                    className="w-full h-56 object-cover rounded-xl shadow"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === VISTA PRINCIPAL (LISTADO FAVORITOS + INSCRIPCIONES) ===
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
                  onClick={() => setTourSeleccionado(tour)}
                  className="bg-white rounded-2xl border border-emerald-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer group"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={imagenFinal}
                      alt={nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                      ✓ Inscripto
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-lg line-clamp-1 group-hover:text-indigo-600 transition">
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
                        onClick={(e) => handleToggleInscripcion(e, tour)}
                        disabled={procesando}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer"
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
                  onClick={() => setTourSeleccionado(tour)}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={imagenFinal}
                      alt={nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {tour.categoria?.nombre && (
                      <span className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-xs">
                        {tour.categoria.nombre}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-lg leading-snug line-clamp-1 group-hover:text-indigo-600 transition">
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
                        onClick={(e) => handleQuitarFavorito(e, tourId)}
                        className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-2 rounded-xl border border-rose-200 transition duration-150 cursor-pointer active:scale-95"
                        title="Quitar de favoritos"
                      >
                        <span>❤️</span> Quitar
                      </button>
                    </div>

                    <button
                      onClick={(e) => handleToggleInscripcion(e, tour)}
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
