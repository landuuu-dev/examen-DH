import React, { useEffect, useState } from "react";

function Recomendaciones() {
  const [tours, setTours] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [tourSeleccionado, setTourSeleccionado] = useState(null);
  const [verTodasImagenes, setVerTodasImagenes] = useState(false);

  const BACKEND_URL = "https://backend-examen-dh.onrender.com";

  // Función auxiliar para formatear la URL de las imágenes correctamente
  const getImagenUrl = (img) => {
    if (!img) return "";

    // Si la imagen es un string y ya incluye http:// o https://
    if (typeof img === "string") {
      if (img.startsWith("http://") || img.startsWith("https://")) {
        return img;
      }
      return `${BACKEND_URL}${img.startsWith("/") ? "" : "/"}${img}`;
    }

    // Si la imagen viene como objeto (ej: { id: 1, url: '...' })
    if (typeof img === "object" && img.url) {
      if (img.url.startsWith("http://") || img.url.startsWith("https://")) {
        return img.url;
      }
      return `${BACKEND_URL}${img.url.startsWith("/") ? "" : "/"}${img.url}`;
    }

    return "";
  };

  useEffect(() => {
    fetch(`${BACKEND_URL}/tours`)
      .then((res) => res.json())
      .then((data) => {
        // Log para depuración en la consola de F12
        console.log("Respuesta obtenida de /tours:", data);

        const toursAleatorios = Array.isArray(data)
          ? [...data].sort(() => Math.random() - 0.5)
          : [];

        setTours(toursAleatorios);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar tours:", err);
        setLoading(false);
      });
  }, []);

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

  // Cálculos de paginación
  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = tours.slice(indexOfFirstTour, indexOfLastTour);
  const totalPages = Math.ceil(tours.length / toursPerPage) || 1;

  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);

  // === VISTA DE DETALLE DEL TOUR SELECCIONADO ===
  if (tourSeleccionado) {
    const imagenes =
      tourSeleccionado.imagenes || tourSeleccionado.imagenesUrl || [];

    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto mt-6">
        {/* Encabezado y Volver */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              {tourSeleccionado.nombre}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              📍 {tourSeleccionado.ubicacion || "Ubicación no especificada"}
            </p>
          </div>
          <button
            onClick={() => {
              setTourSeleccionado(null);
              setVerTodasImagenes(false);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
          >
            ← Volver al listado
          </button>
        </div>

        {/* Descripción y Precio */}
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
          <p className="text-slate-600 leading-relaxed md:w-3/4">
            {tourSeleccionado.descripcion}
          </p>
          <div className="text-right">
            <span className="text-sm text-slate-400 block">
              Precio por persona
            </span>
            <span className="text-2xl font-bold text-indigo-600">
              ${tourSeleccionado.precio}
            </span>
          </div>
        </div>

        {/* Galería de Imágenes */}
        {imagenes.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Imagen Principal */}
            <div className="md:w-1/2">
              <img
                src={getImagenUrl(imagenes[0])}
                alt={tourSeleccionado.nombre}
                className="w-full h-80 md:h-[400px] object-cover rounded-2xl shadow-md"
              />
            </div>

            {/* Cuadrícula de Imágenes Secundarias */}
            <div className="md:w-1/2 grid grid-cols-2 gap-2 relative">
              {imagenes.slice(1, 5).map((img, i) => (
                <img
                  key={i}
                  src={getImagenUrl(img)}
                  alt={`${tourSeleccionado.nombre} miniatura ${i + 1}`}
                  className="w-full h-36 md:h-48 object-cover rounded-xl shadow-sm"
                />
              ))}

              {/* Botón "Ver más" sobrepuesto si hay más de 5 imágenes */}
              {imagenes.length > 5 && (
                <button
                  onClick={() => setVerTodasImagenes(true)}
                  className="col-span-2 py-3 bg-slate-900/80 hover:bg-slate-900 text-white text-center font-semibold rounded-xl transition backdrop-blur-sm"
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

        {/* Modal de Todas las Imágenes */}
        {verTodasImagenes && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-5xl my-8 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-xl font-bold text-slate-800">
                  Todas las imágenes ({imagenes.length})
                </h3>
                <button
                  onClick={() => setVerTodasImagenes(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-2xl px-2"
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

  // === VISTA PRINCIPAL (LISTADO DE TOURS) ===
  return (
    <div className="p-6 max-w-7xl mx-auto mt-20">
      <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">
        Recomendaciones
      </h2>

      {tours.length === 0 ? (
        <p className="text-center text-slate-500 my-12">
          No hay tours disponibles por el momento.
        </p>
      ) : (
        <>
          {/* Tarjetas de Tours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {currentTours.map((tour) => {
              const listaImagenes = tour.imagenes || tour.imagenesUrl || [];
              const primeraImagen =
                listaImagenes.length > 0
                  ? getImagenUrl(listaImagenes[0])
                  : null;

              return (
                <div
                  key={tour.id}
                  onClick={() => setTourSeleccionado(tour)}
                  className="bg-white shadow-sm hover:shadow-xl rounded-2xl p-5 border border-slate-200 hover:border-indigo-200 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {primeraImagen ? (
                      <div className="overflow-hidden rounded-xl mb-4 h-48 bg-slate-100">
                        <img
                          src={primeraImagen}
                          alt={tour.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-slate-100 rounded-xl mb-4 flex items-center justify-center text-slate-400 text-sm">
                        Sin Imagen
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition mb-2">
                      {tour.nombre}
                    </h3>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {tour.descripcion}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-400">
                      📍 {tour.ubicacion || "General"}
                    </span>
                    <span className="font-bold text-indigo-600 text-lg">
                      ${tour.precio}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls de Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={goToFirst}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg disabled:opacity-40 disabled:hover:bg-indigo-50 transition"
              >
                ⏮️ Inicio
              </button>

              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg disabled:opacity-40 disabled:hover:bg-indigo-50 transition"
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
                className="px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg disabled:opacity-40 disabled:hover:bg-indigo-50 transition"
              >
                Siguiente ▶️
              </button>

              <button
                onClick={goToLast}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg disabled:opacity-40 disabled:hover:bg-indigo-50 transition"
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
