import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ToursPorCategoria() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "https://backend-examen-dh.onrender.com";

  // Helper para formatear las URLs de las imágenes
  const getImagenUrl = (img) => {
    if (!img) return "https://via.placeholder.com/400x250?text=Sin+Imagen";

    if (typeof img === "string") {
      if (img.startsWith("http://") || img.startsWith("https://")) return img;
      return `${BACKEND_URL}${img.startsWith("/") ? "" : "/"}${img}`;
    }

    if (typeof img === "object" && img.url) {
      if (img.url.startsWith("http://") || img.url.startsWith("https://"))
        return img.url;
      return `${BACKEND_URL}${img.url.startsWith("/") ? "" : "/"}${img.url}`;
    }

    return "https://via.placeholder.com/400x250?text=Sin+Imagen";
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetch(`${BACKEND_URL}/tours/categoria/${id}`)
      .then((res) => {
        if (!res.ok) {
          console.warn(
            `El backend respondió con estado ${res.status} al consultar la categoría.`,
          );
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setTours(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al consultar la categoría:", err);
        setTours([]);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] gap-3 text-indigo-600 font-medium mt-16">
        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span>Cargando tours de la categoría...</span>
      </div>
    );
  }

  // Extraemos el nombre de la categoría del primer tour disponible si existe
  const nombreCategoriaHeader =
    tours.length > 0 && tours[0].nombreCategoria
      ? `Tours de ${tours[0].nombreCategoria}`
      : "Tours Disponibles";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 mt-16">
      {/* Botón de volver */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition cursor-pointer"
      >
        ← Volver a Categorías
      </button>

      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">
        {nombreCategoriaHeader}
      </h1>

      {tours.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <span className="text-4xl mb-3 block">📍</span>
          <p className="text-slate-700 font-bold text-lg">
            No hay tours en esta categoría por el momento.
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Explora otras categorías para encontrar más actividades.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => {
            const tourId = tour.id || tour._id;
            const imagenesList = Array.isArray(tour.imagenes)
              ? tour.imagenes
              : Array.isArray(tour.imagenesUrl)
                ? tour.imagenesUrl
                : [];

            const primeraImagen = getImagenUrl(imagenesList[0]);

            return (
              <div
                key={tourId}
                onClick={() => navigate(`/tour/${tourId}`)} // Permite hacer clic a la tarjeta para ver detalle
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={primeraImagen}
                      alt={tour.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {tour.nombreCategoria && (
                      <span className="absolute top-3 right-3 bg-indigo-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                        {tour.nombreCategoria}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                      {tour.nombre}
                    </h2>
                    <p className="text-slate-600 text-sm line-clamp-2">
                      {tour.descripcion || "Sin descripción disponible."}
                    </p>
                    <p className="text-xs font-bold text-slate-500 pt-1">
                      📍 {tour.ubicacion || "Ubicación general"}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Precio</span>
                    <span className="text-xl font-bold text-indigo-600">
                      ${tour.precio}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition flex items-center gap-1">
                    Ver más →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ToursPorCategoria;
