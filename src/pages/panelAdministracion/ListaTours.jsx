import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CardTour from "../panelAdministracion/CardTour";
import EditTourModal from "../panelAdministracion/EditTourModal";

export default function ListaTours() {
  const [tours, setTours] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorApi, setErrorApi] = useState(null);
  const [tourAEditar, setTourAEditar] = useState(null);

  // Hook de React Router para escuchar la URL
  const [searchParams] = useSearchParams();

  const BACKEND_URL = "https://backend-examen-dh.onrender.com";

  const obtenerTours = async () => {
    setCargando(true);
    setErrorApi(null);

    try {
      // Leemos los parámetros directamente de la URL actual
      const nombre = searchParams.get("nombre");
      const categoriaId = searchParams.get("categoriaId");

      let endpoint = `${BACKEND_URL}/tours`;

      // Si existe algún parámetro, llamamos a /tours/search
      if (nombre || categoriaId) {
        const queryParams = new URLSearchParams();
        if (nombre) queryParams.append("nombre", nombre);
        if (categoriaId) queryParams.append("categoriaId", categoriaId);

        endpoint = `${BACKEND_URL}/tours/search?${queryParams.toString()}`;
      }

      console.log("Fetching desde:", endpoint); // Revisa esto en la consola F12

      const res = await fetch(endpoint);

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(
          `Error ${res.status}: ${errorMsg || "Error al obtener tours"}`,
        );
      }

      const data = await res.json();

      // Mapeo directo al atributo "content" de la respuesta paginada
      if (data && Array.isArray(data.content)) {
        setTours(data.content);
      } else if (Array.isArray(data)) {
        setTours(data);
      } else {
        setTours([]);
      }
    } catch (err) {
      console.error("Error al cargar los tours:", err);
      setErrorApi(err.message);
      setTours([]);
    } finally {
      setCargando(false);
    }
  };

  // Escuchamos la representación en string de los searchParams
  useEffect(() => {
    obtenerTours();
  }, [searchParams.toString()]);

  if (cargando) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Cargando tours...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Administración de Tours</h1>

      {errorApi && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-bold">Error al conectar con la API:</p>
          <p className="text-sm">{errorApi}</p>
        </div>
      )}

      {tours.length === 0 && !errorApi ? (
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
          <p className="text-slate-500">
            No se encontraron tours con ese criterio de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <CardTour
              key={tour.id}
              tourData={tour}
              onDelete={obtenerTours}
              onEdit={(data) => setTourAEditar(data)}
            />
          ))}
        </div>
      )}

      {tourAEditar && (
        <EditTourModal
          tour={tourAEditar}
          onClose={() => setTourAEditar(null)}
          onTourActualizado={obtenerTours}
        />
      )}
    </div>
  );
}
