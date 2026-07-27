import React, { useState } from "react";

function VistaEnDetalleRecomendaciones({
  tour,
  onVolver,
  misInscripciones,
  inscribiendoId,
  onToggleInscripcion,
  getImagenUrl,
  obtenerFechasTour,
  obtenerCuposTour,
}) {
  const [verTodasImagenes, setVerTodasImagenes] = useState(false);

  if (!tour) return null;

  const imagenes = tour.imagenes || tour.imagenesUrl || [];
  const idActual = tour.id || tour._id;
  const estaInscripto = misInscripciones.includes(idActual);
  const estaCargando = inscribiendoId === idActual;

  const cuposDisponibles = obtenerCuposTour(tour);
  const estadoTour =
    tour.estado || (cuposDisponibles === 0 ? "AGOTADO" : "ACTIVO");

  // Helper para mostrar color según el estado
  const getBadgeEstado = (estado) => {
    switch (estado?.toUpperCase()) {
      case "ACTIVO":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "AGOTADO":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELADO":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto mt-6">
      {/* Cabecera del Detalle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 mb-6 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-bold text-slate-800">
              {tour.nombre || tour.titulo}
            </h2>

            {/* Estado del Tour */}
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${getBadgeEstado(
                estadoTour,
              )}`}
            >
              ● {estadoTour}
            </span>

            {/* Categoría */}
            {(tour.categoria?.nombre || tour.nombreCategoria) && (
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                {tour.categoria?.nombre || tour.nombreCategoria}
              </span>
            )}
          </div>

          <p className="text-slate-500 text-sm mt-1.5 flex items-center gap-1">
            📍 {tour.ubicacion || tour.destino || "Ubicación no especificada"}
          </p>
        </div>

        <button
          onClick={onVolver}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition cursor-pointer self-start sm:self-auto"
        >
          ← Volver
        </button>
      </div>

      {/* Grid con la Ficha de Información del Tour */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            🗓️ Fechas del Tour
          </span>
          <p className="text-sm font-semibold text-slate-800">
            {obtenerFechasTour(tour)}
          </p>
          {(tour.fechaInicio || tour.fechaFin) && (
            <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-500 space-y-0.5">
              {tour.fechaInicio && (
                <p>
                  <strong>Inicio:</strong> {tour.fechaInicio}
                </p>
              )}
              {tour.fechaFin && (
                <p>
                  <strong>Término:</strong> {tour.fechaFin}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            👥 Disponibilidad
          </span>
          <p className="text-sm font-semibold text-slate-800">
            {cuposDisponibles !== null
              ? `${cuposDisponibles} cupos disponibles`
              : "Consultar disponibilidad"}
          </p>
          {tour.cuposTotales && (
            <p className="mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-500">
              <strong>Capacidad total:</strong> {tour.cuposTotales} personas
            </p>
          )}
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              🏷️ Estado de Reserva
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {estadoTour === "ACTIVO"
                ? "Inscripciones Abiertas"
                : estadoTour === "AGOTADO"
                  ? "Sin cupos disponibles"
                  : "Tour No Disponible"}
            </p>
          </div>
        </div>
      </div>

      {/* Descripción y Bloque de Precio / Inscripción */}
      <div className="mb-6 bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="md:w-2/3 space-y-2">
          <h3 className="font-bold text-slate-800 text-lg">
            Descripción de la experiencia
          </h3>
          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            {tour.descripcion || "Sin descripción disponible para este tour."}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium block">
              Precio por persona
            </span>
            <span className="text-3xl font-bold text-indigo-600">
              ${tour.precio ?? 0} USD
            </span>
          </div>

          <button
            onClick={(e) => onToggleInscripcion(e, idActual)}
            disabled={
              estaCargando ||
              estadoTour === "CANCELADO" ||
              (estadoTour === "AGOTADO" && !estaInscripto)
            }
            className={`w-full md:w-auto px-6 py-3 font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              estaInscripto
                ? "bg-emerald-700 hover:bg-rose-700 text-white"
                : estadoTour === "CANCELADO" || estadoTour === "AGOTADO"
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
            } disabled:opacity-60`}
          >
            {estaCargando ? (
              <span>Procesando...</span>
            ) : estaInscripto ? (
              <>
                <span>✓</span> Ya estás inscrito
              </>
            ) : estadoTour === "AGOTADO" ? (
              <span>Agotado</span>
            ) : estadoTour === "CANCELADO" ? (
              <span>No disponible</span>
            ) : (
              <span>🎟️ Inscribirme al tour</span>
            )}
          </button>
        </div>
      </div>

      {/* Galería de imágenes */}
      {imagenes.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2">
            <img
              src={getImagenUrl(imagenes[0])}
              alt={tour.nombre}
              className="w-full h-80 md:h-[400px] object-cover rounded-2xl shadow-md"
            />
          </div>

          <div className="md:w-1/2 grid grid-cols-2 gap-2 relative">
            {imagenes.slice(1, 5).map((img, i) => (
              <img
                key={i}
                src={getImagenUrl(img)}
                alt={`${tour.nombre} miniatura ${i + 1}`}
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

      {/* Modal para ver todas las imágenes */}
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
                  alt={`${tour.nombre} ${i + 1}`}
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

export default VistaEnDetalleRecomendaciones;
