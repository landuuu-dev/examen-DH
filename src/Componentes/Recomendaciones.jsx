import React, { useEffect, useState } from "react";

function Recomendaciones() {
  const [tours, setTours] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [tourSeleccionado, setTourSeleccionado] = useState(null);
  const [verTodasImagenes, setVerTodasImagenes] = useState(false);

  const BACKEND_URL = "http://localhost:8080";

  useEffect(() => {
    fetch(`${BACKEND_URL}/tours`)
      .then((res) => res.json())
      .then((data) => {
        const toursAleatorios = data.sort(() => Math.random() - 0.5);
        setTours(toursAleatorios);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar tours:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Cargando recomendaciones...</p>;

  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = tours.slice(indexOfFirstTour, indexOfLastTour);
  const totalPages = Math.ceil(tours.length / toursPerPage);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);

  // === VISTA DETALLE DEL PRODUCTO ===
  if (tourSeleccionado) {
    const imagenes = tourSeleccionado.imagenes || [];
    return (
      <div className="p-4 mt-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-2xl font-bold">{tourSeleccionado.nombre}</h2>
          <button
            onClick={() => { setTourSeleccionado(null); setVerTodasImagenes(false); }}
            className="text-indigo-600 font-semibold hover:underline"
          >
            ← Volver
          </button>
        </div>

        {/* Body */}
        <div className="mb-4 text-gray-700">{tourSeleccionado.descripcion}</div>

        {/* Galería */}
        {imagenes.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Imagen principal */}
            <div className="md:w-1/2">
              <img
                src={`${BACKEND_URL}${imagenes[0]}`}
                alt={tourSeleccionado.nombre}
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>

            {/* Cuadrícula de otras 4 imágenes */}
            <div className="md:w-1/2 grid grid-cols-2 grid-rows-2 gap-2">
              {imagenes.slice(1, 5).map((img, i) => (
                <img
                  key={i}
                  src={`${BACKEND_URL}${img}`}
                  alt={`${tourSeleccionado.nombre} ${i+1}`}
                  className="w-full h-48 object-cover rounded-xl"
                />
              ))}
              {/* Bloque "Ver más" */}
              {imagenes.length > 5 && (
                <button
                  onClick={() => setVerTodasImagenes(true)}
                  className="col-span-2 row-span-1 bg-black bg-opacity-50 text-white text-center font-semibold rounded-xl"
                >
                  Ver más
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal o sección con todas las imágenes */}
        {verTodasImagenes && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 overflow-auto">
            <div className="bg-white rounded-xl p-4 w-full max-w-6xl">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold">Todas las imágenes</h3>
                <button onClick={() => setVerTodasImagenes(false)} className="text-red-600 font-bold text-xl">×</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {imagenes.map((img, i) => (
                  <img key={i} src={`${BACKEND_URL}${img}`} alt={`${tourSeleccionado.nombre} ${i}`} className="w-full h-64 object-cover rounded-xl"/>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 mt-24">
      <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">Recomendaciones</h2>

      {tours.length === 0 ? (
        <p className="text-center text-gray-500">No hay tours disponibles.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {currentTours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white shadow-md rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition duration-200 cursor-pointer"
                onClick={() => setTourSeleccionado(tour)}
              >
                {tour.imagenes?.length > 0 && (
                  <img
                    src={`${BACKEND_URL}${tour.imagenes[0]}`}
                    alt={tour.nombre}
                    className="w-full h-40 object-cover rounded-xl mb-3"
                  />
                )}
                <h3 className="text-xl font-semibold text-indigo-600 mb-1">{tour.nombre}</h3>
                <p className="text-gray-600 text-sm mb-2">{tour.descripcion}</p>
                <p className="font-medium text-gray-800">${tour.precio}</p>
                <p className="text-gray-500 text-sm">{tour.ubicacion}</p>
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div className="flex flex-wrap justify-center items-center gap-3">
            <button onClick={goToFirst} disabled={currentPage === 1} className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md disabled:opacity-40">⏮️ Inicio</button>
            <button onClick={prevPage} disabled={currentPage === 1} className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md disabled:opacity-40">◀️ Anterior</button>
            <span className="text-gray-700 font-medium">Página {currentPage} de {totalPages}</span>
            <button onClick={nextPage} disabled={currentPage === totalPages} className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md disabled:opacity-40">Siguiente ▶️</button>
            <button onClick={goToLast} disabled={currentPage === totalPages} className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md disabled:opacity-40">⏭️ Final</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Recomendaciones;
