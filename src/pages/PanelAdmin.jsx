import React, { useEffect, useState } from "react";
import axios from "axios";
import CrearCategoria from "../Componentes/CrearCategoria";
import ErrorPanel from "../componentesEstaticos/ErrorPanel.jsx";

function PanelAdmin() {
  const [tours, setTours] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nuevoTour, setNuevoTour] = useState({
    nombre: "",
    categoria: "",
    descripcion: "",
    ubicacion: "",
    precio: "",
    imagenes: "",
  });
  const [editando, setEditando] = useState(null);
  const [mostrarCrearCategoria, setMostrarCrearCategoria] = useState(false);
  const [categoriaError, setCategoriaError] = useState(false);
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768); // Detecta ancho inicial

  const API_URL = "http://localhost:8080/tours";
  const API_CATEGORIAS = "http://localhost:8080/categorias";

  // Detectar cambios de tamaño
  useEffect(() => {
    const checkWidth = () => setEsMovil(window.innerWidth < 768);
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // Obtener tours
  const obtenerTours = async () => {
    try {
      const res = await axios.get(API_URL);
      setTours(res.data);
    } catch (error) {
      console.error("Error al obtener tours:", error);
    }
  };

  // Obtener categorías
  const obtenerCategorias = async () => {
    try {
      const res = await axios.get(API_CATEGORIAS);
      setCategorias(res.data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  useEffect(() => {
    obtenerTours();
    obtenerCategorias();
  }, []);

  // Crear tour con validaciones
  const crearTour = async () => {
    const nombreTrim = nuevoTour.nombre.trim();
    if (!nombreTrim) return alert("El nombre del tour no puede estar vacío");
    if (!nuevoTour.categoria) {
      setCategoriaError(true);
      return alert("Debes seleccionar una categoría");
    }

    // Verificar duplicado
    const resTours = await axios.get(API_URL);
    const nombreExiste = resTours.data.some(
      (tour) => tour.nombre.toLowerCase() === nombreTrim.toLowerCase()
    );
    if (nombreExiste) return alert("Ya existe un tour con ese nombre.");

    try {
      const imagenesArray = nuevoTour.imagenes
        .split(",")
        .map((url) => url.trim());
      const categoriaSeleccionada = categorias.find(
        (c) => c.id === nuevoTour.categoria
      );

      await axios.post(
        API_URL,
        {
          ...nuevoTour,
          categoria: categoriaSeleccionada,
          precio: parseInt(nuevoTour.precio),
          imagenes: imagenesArray,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setNuevoTour({
        nombre: "",
        categoria: "",
        descripcion: "",
        ubicacion: "",
        precio: "",
        imagenes: "",
      });
      setCategoriaError(false);
      obtenerTours();
    } catch (error) {
      console.error("Error al crear tour:", error);
    }
  };

  // Actualizar tour con validaciones
  const actualizarTour = async () => {
    const nombreTrim = nuevoTour.nombre.trim();
    if (!nombreTrim) return alert("El nombre del tour no puede estar vacío");
    if (!nuevoTour.categoria) {
      setCategoriaError(true);
      return alert("Debes seleccionar una categoría");
    }

    const resTours = await axios.get(API_URL);
    const nombreExiste = resTours.data.some(
      (tour) =>
        tour.nombre.toLowerCase() === nombreTrim.toLowerCase() &&
        tour.id !== editando
    );
    if (nombreExiste) return alert("Ya existe otro tour con ese nombre.");

    try {
      const imagenesArray = nuevoTour.imagenes
        .split(",")
        .map((url) => url.trim());
      const categoriaSeleccionada = categorias.find(
        (c) => c.id === nuevoTour.categoria
      );

      await axios.put(
        `${API_URL}/${editando}`,
        {
          ...nuevoTour,
          categoria: categoriaSeleccionada,
          precio: parseInt(nuevoTour.precio),
          imagenes: imagenesArray,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setEditando(null);
      setNuevoTour({
        nombre: "",
        categoria: "",
        descripcion: "",
        ubicacion: "",
        precio: "",
        imagenes: "",
      });
      setCategoriaError(false);
      obtenerTours();
    } catch (error) {
      console.error("Error al actualizar tour:", error);
    }
  };

  // Eliminar tour
  const eliminarTour = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este tour?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      obtenerTours();
    } catch (error) {
      console.error("Error al eliminar tour:", error);
    }
  };

  // Editar tour
  const editarTour = (tour) => {
    setEditando(tour.id);
    setNuevoTour({
      nombre: tour.nombre,
      categoria: tour.categoria?.id || "",
      descripcion: tour.descripcion,
      ubicacion: tour.ubicacion,
      precio: tour.precio,
      imagenes: tour.imagenes.join(", "),
    });
    setCategoriaError(false);
  };

  // Toggle CrearCategoria
  const toggleCrearCategoria = () => {
    setMostrarCrearCategoria(!mostrarCrearCategoria);
    obtenerCategorias();
    obtenerTours();
  };

  return (
    <>
      {esMovil ? (
        <ErrorPanel />
      ) : (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
              Panel de Administración de Tours
            </h1>

            {/* Formulario */}
            <div className="mb-8 bg-gray-100 rounded-xl p-6 shadow-inner">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {editando ? "Editar Tour" : "Crear Nuevo Tour"}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  className="border p-2 rounded"
                  value={nuevoTour.nombre}
                  onChange={(e) =>
                    setNuevoTour({ ...nuevoTour, nombre: e.target.value })
                  }
                />

                <select
                  className={`border p-2 rounded ${
                    categoriaError ? "border-red-600" : ""
                  }`}
                  value={nuevoTour.categoria}
                  onChange={(e) => {
                    setNuevoTour({ ...nuevoTour, categoria: e.target.value });
                    setCategoriaError(false);
                  }}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Ubicación"
                  className="border p-2 rounded"
                  value={nuevoTour.ubicacion}
                  onChange={(e) =>
                    setNuevoTour({ ...nuevoTour, ubicacion: e.target.value })
                  }
                />

                <input
                  type="number"
                  placeholder="Precio"
                  className="border p-2 rounded"
                  value={nuevoTour.precio}
                  onChange={(e) =>
                    setNuevoTour({ ...nuevoTour, precio: e.target.value })
                  }
                />
              </div>

              <textarea
                placeholder="Descripción"
                className="border p-2 rounded w-full mt-4"
                rows="3"
                value={nuevoTour.descripcion}
                onChange={(e) =>
                  setNuevoTour({ ...nuevoTour, descripcion: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="URLs de imágenes (separadas por coma)"
                className="border p-2 rounded w-full mt-4"
                value={nuevoTour.imagenes}
                onChange={(e) =>
                  setNuevoTour({ ...nuevoTour, imagenes: e.target.value })
                }
              />

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={editando ? actualizarTour : crearTour}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {editando ? "Actualizar" : "Crear"}
                </button>

                <button
                  onClick={toggleCrearCategoria}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Crear Categoría
                </button>

                {editando && (
                  <button
                    onClick={() => {
                      setEditando(null);
                      setNuevoTour({
                        nombre: "",
                        categoria: "",
                        descripcion: "",
                        ubicacion: "",
                        precio: "",
                        imagenes: "",
                      });
                      setCategoriaError(false);
                    }}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {/* Formulario CrearCategoria */}
              {mostrarCrearCategoria && (
                <CrearCategoria
                  onCategoriaCreada={() => {
                    obtenerCategorias();
                    obtenerTours();
                    setMostrarCrearCategoria(false);
                  }}
                />
              )}
            </div>

            {/* Tabla de tours */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-blue-100 text-blue-800">
                  <tr>
                    <th className="p-2 text-left">Nombre</th>
                    <th className="p-2 text-left">Categoría</th>
                    <th className="p-2 text-left">Ubicación</th>
                    <th className="p-2 text-left">Precio</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.map((tour) => (
                    <tr
                      key={tour.id}
                      className="border-t hover:bg-gray-50 transition-all"
                    >
                      <td className="p-2">{tour.nombre}</td>
                      <td className="p-2">
                        {tour.categoria?.nombre || "Sin categoría"}
                      </td>
                      <td className="p-2">{tour.ubicacion}</td>
                      <td className="p-2">${tour.precio}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => editarTour(tour)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarTour(tour.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PanelAdmin;
