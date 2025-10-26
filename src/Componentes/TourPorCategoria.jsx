import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function ToursPorCategoria() {
  const { id } = useParams();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/tours/categoria/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTours(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar tours:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500">Cargando tours...</p>
    );

  return (
    <div className="p-6 mt-24"> {/* 👈 margen superior para compensar el header */}
      <Link to="/" className="text-indigo-600 hover:underline block mb-4">
        ← Volver a inicio
      </Link>

      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">
        Tours de la categoría
      </h1>

      {tours.length === 0 ? (
        <p className="text-center text-gray-500">
          No hay tours en esta categoría.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white shadow-md rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition duration-200"
            >
              {tour.imagenes?.length > 0 && (
                <img
                  src={tour.imagenes[0]}
                  alt={tour.nombre}
                  className="w-full h-40 object-cover rounded-xl mb-3"
                />
              )}
              <h2 className="text-xl font-semibold text-indigo-600 mb-1">
                {tour.nombre}
              </h2>
              <p className="text-gray-600 text-sm mb-2">{tour.descripcion}</p>
              <p className="font-medium text-gray-800">${tour.precio}</p>
              <p className="text-gray-500 text-sm">{tour.ubicacion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ToursPorCategoria;
