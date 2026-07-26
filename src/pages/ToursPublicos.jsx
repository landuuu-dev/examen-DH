import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BarraBusqueda from "../Componentes/BarraBusqueda"; // Ajusta la ruta según tu estructura
import BotonFavorito from "../componentesEstaticos/BotonFavorito";
import { useFavoritos } from "../hooks/UseFavoritos";

export default function ToursPublicos({ usuario, token }) {
  // 1. Hook de favoritos para conectarlo con el backend
  const { favoritosIds, toggleFavorito } = useFavoritos(usuario, token);

  const [tours, setTours] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorApi, setErrorApi] = useState(null);

  const [searchParams] = useSearchParams();
  const BACKEND_URL = "https://backend-examen-dh.onrender.com";

  // Función auxiliar para URLs de imágenes
  const getImagenUrl = (img) => {
    if (!img) return "";
    if (typeof img === "string") {
      if (img.startsWith("http://") || img.startsWith("https://")) return img;
      return `${BACKEND_URL}${img.startsWith("/") ? "" : "/"}${img}`;
    }
    if (typeof img === "object" && img.url) {
      if (img.url.startsWith("http://") || img.url.startsWith("https://"))
        return img.url;
      return `${BACKEND_URL}${img.url.startsWith("/") ? "" : "/"}${img.url}`;
    }
    return "";
  };

  const obtenerTours = async () => {
    setCargando(true);
    setErrorApi(null);

    try {
      const nombre = searchParams.get("nombre")?.trim();
      const categoriaId = searchParams.get("categoriaId");

      let endpoint = `${BACKEND_URL}/tours`;

      if (nombre) {
        const queryParams = new URLSearchParams();
        queryParams.append("nombre", nombre);
        if (categoriaId) queryParams.append("categoriaId", categoriaId);

        endpoint = `${BACKEND_URL}/tours/search?${queryParams.toString()}`;
      }

      console.log("Fetching desde:", endpoint);

      const res = await fetch(endpoint);

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(
          `Error ${res.status}: ${errorMsg || "Error al obtener tours"}`,
        );
      }

      const data = await res.json();

      let listaObtenida = [];
      if (data && Array.isArray(data.content)) {
        listaObtenida = data.content;
      } else if (Array.isArray(data)) {
        listaObtenida = data;
      }

      if (!nombre && categoriaId) {
        listaObtenida = listaObtenida.filter((tour) => {
          if (!tour.nombreCategoria) return false;
          const catTour = tour.nombreCategoria.trim().toLowerCase();
          const catBuscada = categoriaId.trim().toLowerCase();
          return catTour === catBuscada || catTour.includes(catBuscada);
        });
      }

      setTours(listaObtenida);
    } catch (err) {
      console.error("Error al cargar los tours:", err);
      setErrorApi(err.message);
      setTours([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerTours();
  }, [searchParams.toString()]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Barra de Búsqueda arriba */}
      <BarraBusqueda />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {searchParams.get("nombre")
            ? `Resultados para: "${searchParams.get("nombre")}"`
            : "Nuestros Tours Disponibles"}
        </h2>

        {errorApi && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl">
            {errorApi}
          </div>
        )}

        {cargando ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            Buscando tours...
          </div>
        ) : tours.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
            <p className="text-slate-500 text-lg">
              No encontramos ningún tour que coincida con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => {
              const listaImagenes = tour.imagenes || tour.imagenesUrl || [];
              const primeraImagen =
                listaImagenes.length > 0
                  ? getImagenUrl(listaImagenes[0])
                  : null;

              return (
                <div
                  key={tour.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col"
                >
                  {/* Imagen principal del Tour */}
                  <div className="h-48 w-full bg-slate-200 overflow-hidden relative">
                    {primeraImagen ? (
                      <img
                        src={primeraImagen}
                        alt={tour.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        Sin imagen
                      </div>
                    )}

                    {/* Categoría arriba a la derecha */}
                    {tour.nombreCategoria && (
                      <span className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        {tour.nombreCategoria}
                      </span>
                    )}

                    {/* 🔴 BOTÓN DE FAVORITO (Arriba a la izquierda) */}
                    <div className="absolute top-3 left-3 z-10">
                      <BotonFavorito
                        tourId={tour.id}
                        esFavorito={favoritosIds.includes(tour.id)}
                        onToggle={toggleFavorito}
                      />
                    </div>
                  </div>

                  {/* Contenido principal */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {tour.nombre}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-2">
                        {tour.descripcion}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">
                          Precio
                        </span>
                        <span className="text-2xl font-extrabold text-indigo-600">
                          ${tour.precio}
                        </span>
                      </div>

                      <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors">
                        Ver detalle
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
