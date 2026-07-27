import React, { useEffect, useState } from "react";
import BotonFavorito from "../componentesEstaticos/BotonFavorito";
import { useFavoritos } from "../hooks/UseFavoritos";
import { inscribirseATour, desinscribirseDeTour } from "../hooks/TourService";
import VistaEnDetalleRecomendaciones from "./VistaEnDetalleRecomendaciones";

function Recomendaciones({ usuario, token }) {
  const { favoritosIds, toggleFavorito } = useFavoritos(usuario, token);

  const [tours, setTours] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [tourSeleccionado, setTourSeleccionado] = useState(null);

  const [inscribiendoId, setInscribiendoId] = useState(null);
  const [misInscripciones, setMisInscripciones] = useState([]);

  const BACKEND_URL = "https://backend-examen-dh.onrender.com";

  // Formateador robusto compatible con "DD-MM-YYYY" e ISO
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return null;
    try {
      if (typeof fechaStr === "string" && fechaStr.includes("-")) {
        const partes = fechaStr.split("-");
        let dia, mes, anio;
        if (partes[0].length === 2) {
          [dia, mes, anio] = partes;
        } else {
          [anio, mes, dia] = partes;
        }
        const fechaObj = new Date(Number(anio), Number(mes) - 1, Number(dia));
        return fechaObj.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      const d = new Date(fechaStr);
      if (isNaN(d.getTime())) return fechaStr;

      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return fechaStr;
    }
  };

  const obtenerFechasTour = (tour) => {
    if (!tour) return "Fecha no especificada";

    const inicioRaw =
      tour.fechaInicio || tour.fecha_inicio || tour.fechaDesde || tour.fecha;

    const finRaw =
      tour.fechaFin ||
      tour.fecha_fin ||
      tour.fechaHasta ||
      tour.fechaFinal ||
      tour.fechaTermino;

    const inicio = formatearFecha(inicioRaw);
    const fin = formatearFecha(finRaw);

    if (inicio && fin && inicio !== fin) return `${inicio} - ${fin}`;
    if (inicio) return inicio;
    if (fin) return fin;
    if (typeof tour.fechas === "string") return tour.fechas;

    return "Fechas a confirmar";
  };

  const obtenerCuposTour = (tour) => {
    if (!tour) return null;
    if (tour.cuposDisponibles !== undefined) return tour.cuposDisponibles;
    if (tour.disponibles !== undefined) return tour.disponibles;
    if (tour.cupos !== undefined) return tour.cupos;
    if (tour.capacidad !== undefined) return tour.capacidad;
    return null;
  };

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
    fetch(`${BACKEND_URL}/tours`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        let listaRaw = [];
        if (Array.isArray(data)) {
          listaRaw = data;
        } else if (data && Array.isArray(data.content)) {
          listaRaw = data.content;
        }

        const toursAleatorios = [...listaRaw].sort(() => Math.random() - 0.5);
        setTours(toursAleatorios);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar tours:", err);
        setTours([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!usuario || !token || token === "undefined" || token === "null") {
      setMisInscripciones([]);
      return;
    }

    fetch(`${BACKEND_URL}/usuarios/me/inscripciones`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const ids = data.map((t) => t.id || t._id).filter(Boolean);
          setMisInscripciones(ids);
        } else {
          setMisInscripciones([]);
        }
      })
      .catch((err) => {
        console.error("Error al cargar mis inscripciones:", err);
        setMisInscripciones([]);
      });
  }, [usuario, token]);

  const handleToggleInscripcion = async (e, tourId) => {
    e.stopPropagation();

    if (!usuario || !token) {
      alert("Debes iniciar sesión para inscribirte en un tour.");
      return;
    }

    const estaInscripto = misInscripciones.includes(tourId);
    setInscribiendoId(tourId);

    try {
      if (estaInscripto) {
        const mensaje = await desinscribirseDeTour(tourId, token);
        setMisInscripciones((prev) => prev.filter((id) => id !== tourId));
        alert(mensaje || "Te has desinscrito del tour correctamente.");
      } else {
        const mensaje = await inscribirseATour(tourId, token);
        setMisInscripciones((prev) => [...prev, tourId]);
        alert(mensaje || "¡Inscripción realizada con éxito!");
      }
    } catch (err) {
      console.error("Error en la petición de inscripción:", err);
      alert(err.message || "Ocurrió un error de conexión con el servidor.");
    } finally {
      setInscribiendoId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-20 gap-3 text-indigo-600 font-medium">
        <svg
          className="animate-spin h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>Cargando recomendaciones...</span>
      </div>
    );
  }

  // Si hay un tour seleccionado, delegamos la renderización al componente de detalle
  if (tourSeleccionado) {
    return (
      <VistaEnDetalleRecomendaciones
        tour={tourSeleccionado}
        onVolver={() => setTourSeleccionado(null)}
        misInscripciones={misInscripciones}
        inscribiendoId={inscribiendoId}
        onToggleInscripcion={handleToggleInscripcion}
        getImagenUrl={getImagenUrl}
        obtenerFechasTour={obtenerFechasTour}
        obtenerCuposTour={obtenerCuposTour}
      />
    );
  }

  // Paginación
  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = tours.slice(indexOfFirstTour, indexOfLastTour);
  const totalPages = Math.ceil(tours.length / toursPerPage) || 1;

  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);

  return (
    <div className="p-6 max-w-7xl mx-auto mt-6">
      <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">
        Recomendaciones
      </h2>

      {tours.length === 0 ? (
        <p className="text-center text-slate-500 my-12">
          No hay tours disponibles por el momento.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {currentTours.map((tour, index) => {
              const tourId = tour.id || tour._id || index;
              const estaInscripto = misInscripciones.includes(tourId);
              const estaCargando = inscribiendoId === tourId;

              const nombre = tour.nombre || tour.titulo || "Tour sin título";
              const descripcion =
                tour.descripcion || "Sin descripción disponible.";
              const precio = tour.precio ?? 0;
              const ubicacion = tour.ubicacion || tour.destino || "General";
              const categoriaNombre =
                tour.categoria?.nombre || tour.nombreCategoria;

              const fechasTexto = obtenerFechasTour(tour);
              const cuposDisponibles = obtenerCuposTour(tour);

              const imagenesList = Array.isArray(tour.imagenes)
                ? tour.imagenes
                : typeof tour.imagenes === "string"
                  ? [tour.imagenes]
                  : Array.isArray(tour.imagenesUrl)
                    ? tour.imagenesUrl
                    : [];
              const imagenFinal = getImagenUrl(imagenesList[0]);

              return (
                <div
                  key={`rec-tour-${tourId}-${index}`}
                  onClick={() => setTourSeleccionado(tour)}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={imagenFinal}
                      alt={nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {categoriaNombre && (
                      <span className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-xs z-10">
                        {categoriaNombre}
                      </span>
                    )}

                    <div className="absolute top-3 right-3 z-10">
                      <BotonFavorito
                        tourId={tourId}
                        esFavorito={favoritosIds.includes(tourId)}
                        onToggle={toggleFavorito}
                      />
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-lg leading-snug line-clamp-1 group-hover:text-indigo-600 transition">
                        {nombre}
                      </h4>
                      <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                        {descripcion}
                      </p>

                      <div className="pt-2 text-xs font-semibold text-slate-500 space-y-1 border-t border-slate-100">
                        <p>
                          📍 <span className="capitalize">{ubicacion}</span>
                        </p>
                        <p className="text-indigo-600">📅 {fechasTexto}</p>
                        {cuposDisponibles !== null && (
                          <p className="text-amber-700">
                            👥 {cuposDisponibles} cupos restantes
                          </p>
                        )}
                      </div>
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
                    </div>

                    <button
                      onClick={(e) => handleToggleInscripcion(e, tourId)}
                      disabled={estaCargando}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition duration-150 cursor-pointer flex items-center justify-center gap-2 ${
                        estaInscripto
                          ? "bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-300"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      } ${estaCargando ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {estaCargando ? (
                        <span>Procesando...</span>
                      ) : estaInscripto ? (
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={goToFirst}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg disabled:opacity-40 disabled:hover:bg-indigo-50 transition cursor-pointer"
              >
                ⏮️ Inicio
              </button>

              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg disabled:opacity-40 disabled:hover:bg-indigo-50 transition cursor-pointer"
              >
                ◀️ Anterior
              </button>

              <span className="px-4 text-sm text-slate-600 font-medium">
                Página{" "}
                <strong className="text-indigo-600">{currentPage}</strong> de{" "}
                {totalPages}
              </span>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg disabled:opacity-40 disabled:hover:bg-indigo-50 transition cursor-pointer"
              >
                Siguiente ▶️
              </button>

              <button
                onClick={goToLast}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg disabled:opacity-40 disabled:hover:bg-indigo-50 transition cursor-pointer"
              >
                ⏭️ Final
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Recomendaciones;
