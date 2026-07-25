import React from "react";

function CardTour({ tourData, onDelete, onEdit }) {
  if (!tourData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
        <div className="w-full h-48 bg-slate-200 rounded-xl mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-slate-200 rounded w-full mb-4"></div>
        <div className="flex gap-2">
          <div className="h-9 bg-slate-200 rounded-lg w-1/2"></div>
          <div className="h-9 bg-slate-200 rounded-lg w-1/2"></div>
        </div>
      </div>
    );
  }

  // Normalización de imágenes (soporta tanto 'imagenes', 'images' o props individuales)
  const obtenerListaImagenes = () => {
    if (Array.isArray(tourData.imagenes) && tourData.imagenes.length > 0)
      return tourData.imagenes;
    if (Array.isArray(tourData.images) && tourData.images.length > 0)
      return tourData.images;
    if (tourData.imagen1 || tourData.imagen2) {
      return [tourData.imagen1, tourData.imagen2, tourData.imagen3].filter(
        Boolean,
      );
    }
    return [];
  };

  const formatUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    return url.startsWith("/")
      ? `https://backend-examen-dh.onrender.com${url}`
      : url;
  };

  const listaImagenes = obtenerListaImagenes();
  const imagenPrincipal = formatUrl(listaImagenes[0]);
  const imagenesAdicionales = listaImagenes
    .slice(1)
    .map(formatUrl)
    .filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Banner de Imagen con Badges */}
        <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
          {imagenPrincipal ? (
            <img
              src={imagenPrincipal}
              alt={`Imagen de ${tourData.nombre}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/400x200?text=Error+al+cargar+imagen";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
              Sin imagen disponible
            </div>
          )}

          {/* Badge de Categoría (si existe) */}
          {tourData.categoria?.nombre && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-indigo-600/90 backdrop-blur-xs text-white text-xs font-semibold rounded-full shadow-xs capitalize">
              {tourData.categoria.nombre}
            </span>
          )}

          {/* Precio Badge */}
          {tourData.precio !== undefined && (
            <span className="absolute bottom-3 right-3 px-3 py-1 bg-slate-900/80 backdrop-blur-xs text-emerald-400 text-xs font-bold rounded-full shadow-xs">
              ${tourData.precio} USD
            </span>
          )}
        </div>

        {/* Detalles del Tour */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-1.5 gap-2">
            <h3 className="text-xl font-bold text-slate-900 capitalize line-clamp-1">
              {tourData.nombre}
            </h3>
          </div>

          {/* Ubicación / Duración opcional */}
          {tourData.ubicacion && (
            <p className="text-xs text-indigo-600 font-medium mb-2 flex items-center gap-1">
              📍 {tourData.ubicacion}
            </p>
          )}

          <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">
            {tourData.descripcion ||
              "Sin descripción disponible para este tour."}
          </p>

          {/* Miniaturas de imágenes extra */}
          {imagenesAdicionales.length > 0 && (
            <div className="flex items-center gap-2 mb-4 pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">
                Fotos extra:
              </span>
              <div className="flex gap-1.5">
                {imagenesAdicionales.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`Vista ${index + 2}`}
                    className="w-8 h-8 rounded-md object-cover border border-slate-200"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onEdit(tourData)}
          className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-700 text-sm font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Editar
        </button>

        <button
          onClick={() => onDelete(tourData.id)}
          className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-200/80 text-red-600 text-sm font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default CardTour;
