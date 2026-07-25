import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://backend-examen-dh.onrender.com/categorias")
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar categorías:", err);
        setLoading(false);
      });
  }, []);

  // Función helper para resolver la URL de la imagen principal de la categoría
  const getImagenUrl = (cat) => {
    let rawUrl = null;

    if (Array.isArray(cat.imagenes) && cat.imagenes.length > 0) {
      rawUrl = cat.imagenes[0];
    } else if (Array.isArray(cat.images) && cat.images.length > 0) {
      rawUrl = cat.images[0];
    } else {
      rawUrl = cat.imagen1 || cat.imagen || cat.urlImagen;
    }

    if (!rawUrl || typeof rawUrl !== "string") return null;

    return rawUrl.startsWith("/")
      ? `https://backend-examen-dh.onrender.com${rawUrl}`
      : rawUrl;
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Encabezado */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 pt-1 pb-[10px] rounded-full border border-indigo-100">
          Explora por Experiencias
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Categorías de Tours
        </h2>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">
          Encuentra el destino perfecto explorando nuestras categorías
          especialmente seleccionadas para ti.
        </p>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse"
            >
              <div className="h-48 bg-slate-200 w-full" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded-md w-1/2" />
                <div className="h-4 bg-slate-200 rounded-md w-full" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid de Categorías */}
      {!loading && (
        <>
          {categorias.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-500 font-medium">
                No hay categorías disponibles por el momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorias.map((cat) => {
                const imgUrl = getImagenUrl(cat);

                return (
                  <div
                    key={cat.id}
                    onClick={() => navigate(`/categorias/${cat.id}/tours`)}
                    className="group cursor-pointer bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Banner de Imagen */}
                      <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={cat.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/400x200?text=Categor%C3%ADa";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50/50 text-indigo-400">
                            <svg
                              className="w-10 h-10 mb-1 opacity-70"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-xs font-medium">
                              Sin imagen
                            </span>
                          </div>
                        )}

                        {/* Overlay Gradiente Sutil */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                        {/* ID o Badge de Tours */}
                        {cat.toursCount !== undefined && (
                          <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-slate-800 text-xs font-bold rounded-full shadow-xs">
                            {cat.toursCount} Tours
                          </span>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="p-5 space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors capitalize line-clamp-1">
                          {cat.nombre}
                        </h3>

                        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                          {cat.descripcion ||
                            "Explora todas las experiencias y tours disponibles en esta categoría."}
                        </p>
                      </div>
                    </div>

                    {/* Footer de la Card con Call-to-Action */}
                    <div className="p-5 pt-0 mt-2 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                      <span>Ver tours disponibles</span>
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Categorias;
