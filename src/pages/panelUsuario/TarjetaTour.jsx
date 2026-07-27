import React from "react";

export default function TarjetaTour({
  tour,
  tipo, // "inscrito" | "favorito"
  estaInscrito,
  procesando,
  onSelectTour,
  onToggleInscripcion,
  onQuitarFavorito,
  getImagenUrl,
  obtenerFechasTour,
  obtenerCuposTour,
}) {
  const tourId = tour?.id || tour?._id;
  const nombre = tour.nombre || tour.titulo || "Tour sin título";
  const descripcion = tour.descripcion || "Sin descripción disponible.";
  const precio = tour.precio ?? 0;
  const ubicacion = tour.ubicacion || tour.destino || "General";
  const fechasTexto = obtenerFechasTour(tour);
  const cuposDisponibles = obtenerCuposTour(tour);

  const imagenesList = Array.isArray(tour.imagenes)
    ? tour.imagenes
    : typeof tour.imagenes === "string"
      ? [tour.imagenes]
      : [];
  const imagenFinal = getImagenUrl(imagenesList[0]);

  if (tipo === "inscrito") {
    return (
      <div
        onClick={() => onSelectTour(tour)}
        className="bg-white rounded-2xl border border-emerald-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer group"
      >
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={imagenFinal}
            alt={nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
            ✓ Inscrito
          </span>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-lg line-clamp-1 group-hover:text-indigo-600 transition">
              {nombre}
            </h4>
            <p className="text-slate-600 text-sm line-clamp-2">{descripcion}</p>

            <div className="pt-2 text-xs font-semibold text-slate-500 space-y-1 border-t border-slate-100">
              <p>📍 {ubicacion}</p>
              <p className="text-indigo-600">📅 {fechasTexto}</p>
              {cuposDisponibles !== null && (
                <p className="text-amber-700">
                  👥 {cuposDisponibles} cupos restantes
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-lg font-bold text-indigo-600">
              ${precio} USD
            </span>

            <button
              onClick={(e) => onToggleInscripcion(e, tour)}
              disabled={procesando}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {procesando ? "Procesando..." : "Cancelar inscripción"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tipo "favorito"
  return (
    <div
      onClick={() => onSelectTour(tour)}
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

          <button
            onClick={(e) => onQuitarFavorito(e, tourId)}
            className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-2 rounded-xl border border-rose-200 transition duration-150 cursor-pointer active:scale-95"
            title="Quitar de favoritos"
          >
            <span>❤️</span> Quitar
          </button>
        </div>

        <button
          onClick={(e) => onToggleInscripcion(e, tour)}
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
}
