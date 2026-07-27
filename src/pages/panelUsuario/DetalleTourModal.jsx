import React, { useState } from "react";

export default function DetalleTourModal({
  tour,
  estaInscrito,
  estaProcesando,
  onVolver,
  onToggleInscripcion,
  getImagenUrl,
  obtenerFechasTour,
  obtenerCuposTour,
}) {
  const [verTodasImagenes, setVerTodasImagenes] = useState(false);

  const imagenes = tour.imagenes || tour.imagenesUrl || [];
  const fechasTexto = obtenerFechasTour(tour);
  const cuposDisponibles = obtenerCuposTour(tour);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto mt-6">
      {/* Encabezado y Volver */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-slate-800">
              {tour.nombre || tour.titulo}
            </h2>
            {tour.categoria?.nombre && (
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                {tour.categoria.nombre}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            📍 {tour.ubicacion || tour.destino || "Ubicación no especificada"}
          </p>
        </div>

        <button
          onClick={onVolver}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
        >
          ← Volver a Mi Cuenta
        </button>
      </div>

      {/* Info adicional: Fechas y Cupos */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-lg border border-blue-200">
          📅 {fechasTexto}
        </span>
        {cuposDisponibles !== null && (
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border ${
              cuposDisponibles > 0
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            👥{" "}
            {cuposDisponibles > 0
              ? `${cuposDisponibles} cupos disponibles`
              : "Agotado"}
          </span>
        )}
      </div>

      {/* Descripción, Precio y Botón de Inscripción */}
      <div className="mb-6 bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-slate-600 leading-relaxed md:w-2/3">
          {tour.descripcion || "Sin descripción disponible."}
        </p>

        <div className="flex flex-col items-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <div className="text-right">
            <span className="text-sm text-slate-400 block">
              Precio por persona
            </span>
            <span className="text-3xl font-bold text-indigo-600">
              ${tour.precio ?? 0} USD
            </span>
          </div>

          <button
            onClick={(e) => onToggleInscripcion(e, tour)}
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

      {/* Modal de Galería completa */}
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
