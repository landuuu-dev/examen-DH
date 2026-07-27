import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BarraBusqueda from "../../Componentes/BarraBusqueda";
import BotonFavorito from "../../componentesEstaticos/BotonFavorito";
import { useFavoritos } from "../../hooks/UseFavoritos";

export default function ToursPublicos({ usuario, token }) {
  // Hook de favoritos para conectarlo con el backend
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

  // Formateador robusto compatible con "DD-MM-YYYY" e ISO
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return null;
    try {
      if (typeof fechaStr === "string" && fechaStr.includes("-")) {
        const partes = fechaStr.split("-");
        let dia, mes, anio;
        if (partes[0].length === 2) {
          // Formato DD-MM-YYYY (Spring Boot DTO @JsonFormat)
          [dia, mes, anio] = partes;
        } else {
          // Formato YYYY-MM-DD (ISO)
          [anio, mes, dia] = partes;
        }
        const fechaObj = new Date(Number(anio), Number(mes) - 1, Number(dia));
        if (isNaN(fechaObj.getTime())) return fechaStr;

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

  // Obtener texto unificado para rango de fechas
  const obtenerFechasTour = (tour) => {
    if (!tour) return "Fecha no especificada";

    const inicioRaw = tour.fechaInicio || tour.fecha_inicio || tour.fecha;
    const finRaw =
      tour.fechaFin || tour.fecha_fin || tour.fechaHasta || tour.fechaTermino;

    const inicio = formatearFecha(inicioRaw);
    const fin = formatearFecha(finRaw);

    if (inicio && fin && inicio !== fin) {
      return `${inicio} - ${fin}`;
    }

    if (inicio) return inicio;
    if (fin) return fin;

    return "Fechas a confirmar";
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

              const fechasTexto = obtenerFechasTour(tour);

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

                    {/* BOTÓN DE FAVORITO */}
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
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">
                        {tour.nombre}
                      </h3>

                      <p className="text-slate-600 text-sm line-clamp-2">
                        {tour.descripcion}
                      </p>

                      {/* 📅 FECHAS DE DISPONIBILIDAD (INICIO - FIN) */}
                      <div className="pt-2 flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
                        <span>📅</span>
                        <span>{fechasTexto}</span>
                      </div>

                      {/* 👥 CUPOS DISPONIBLES */}
                      {tour.cuposDisponibles !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span>🎟️</span>
                          <span>{tour.cuposDisponibles} cupos disponibles</span>
                        </div>
                      )}
                    </div>

                    {/* Pie de tarjeta con PRECIO EN USD */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">
                          Precio por persona
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-indigo-600">
                            ${tour.precio}
                          </span>
                          <span className="text-xs font-bold text-indigo-600">
                            USD
                          </span>
                        </div>
                      </div>

                      <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
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
