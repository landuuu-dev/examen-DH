import React, { useEffect, useState } from "react";
import axios from "axios";
import CardTour from "./CardTour";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function ListaTours() {
  const [toursData, setToursData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Estados para el Modal de Edición
  const [tourEdit, setTourEdit] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newPrecio, setNewPrecio] = useState("");
  const [newUbicacion, setNewUbicacion] = useState("");
  const [newImagenes, setNewImagenes] = useState({});
  const [updating, setUpdating] = useState(false);

  const BASE_URL = "https://backend-examen-dh.onrender.com/tours";

  // ======================
  // OBTENER TOURS
  // ======================
  const fetchTours = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data } = await axios.get(BASE_URL);
      setToursData(data);
    } catch (error) {
      console.error("Error al obtener tours:", error);
      setErrorMsg("No se pudieron cargar los tours.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  // ======================
  // ELIMINAR TOUR
  // ======================
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este tour?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setToursData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error eliminando tour:", error);
      alert("No se pudo eliminar el tour. Revisa tus permisos.");
    }
  };

  // ======================
  // ABRIR MODAL EDICIÓN
  // ======================
  const handleEdit = (tour) => {
    setTourEdit(tour);
    setNewName(tour.nombre || "");
    setNewDescripcion(tour.descripcion || "");
    setNewPrecio(tour.precio || "");
    setNewUbicacion(tour.ubicacion || "");
    setNewImagenes({});
  };

  // ======================
  // MANEJO DE IMÁGENES
  // ======================
  const handleFileChange = (e, imagenNum) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten archivos de imagen.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("La imagen no puede superar los 5 MB.");
      e.target.value = "";
      return;
    }

    setNewImagenes((prev) => ({
      ...prev,
      [`imagen${imagenNum}`]: file,
    }));
  };

  // ======================
  // GUARDAR CAMBIOS (PATCH)
  // ======================
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      if (newName) formData.append("nombre", newName);
      if (newDescripcion) formData.append("descripcion", newDescripcion);
      if (newPrecio) formData.append("precio", newPrecio);
      if (newUbicacion) formData.append("ubicacion", newUbicacion);

      // Mapear imágenes a la clave "imagenes" requerida por Spring Boot
      Object.values(newImagenes).forEach((file) => {
        if (file) formData.append("imagenes", file);
      });

      const { data } = await axios.patch(
        `${BASE_URL}/${tourEdit.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (typeof data === "object" && data.id) {
        setToursData((prev) =>
          prev.map((item) => (item.id === data.id ? data : item)),
        );
      } else {
        fetchTours();
      }

      closeModal();
    } catch (error) {
      console.error("Error actualizando tour:", error);
      alert("No se pudo actualizar el tour.");
    } finally {
      setUpdating(false);
    }
  };

  const closeModal = () => {
    setTourEdit(null);
    setNewImagenes({});
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión de Tours
          </h1>
          <p className="text-slate-500 text-sm">
            Administra, edita o elimina los tours disponibles.
          </p>
        </div>
        <span className="self-start md:self-auto px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-full">
          Total: {toursData.length}
        </span>
      </div>

      {/* Carga */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600"
            viewBox="0 0 24 24"
            fill="none"
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
          <p className="text-sm text-slate-500 font-medium">
            Cargando tours...
          </p>
        </div>
      )}

      {/* Error */}
      {errorMsg && !loading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={fetchTours}
            className="text-xs underline font-semibold hover:text-red-900"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Grid de Cards */}
      {!loading && !errorMsg && (
        <>
          {toursData.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-500 font-medium">
                No hay tours disponibles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {toursData.map((tour) => (
                <CardTour
                  key={tour.id}
                  tourData={tour}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de Edición */}
      {tourEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-xl font-bold text-slate-900">Editar Tour</h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nombre del Tour
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm"
                  placeholder="Ej: Tour Machu Picchu"
                  required
                />
              </div>

              {/* Ubicación y Precio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={newUbicacion}
                    onChange={(e) => setNewUbicacion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm"
                    placeholder="Ej: Cusco, Perú"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Precio ($ USD)
                  </label>
                  <input
                    type="number"
                    value={newPrecio}
                    onChange={(e) => setNewPrecio(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm"
                    placeholder="150"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows="3"
                  value={newDescripcion}
                  onChange={(e) => setNewDescripcion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm"
                  placeholder="Descripción detallada del tour..."
                />
              </div>

              {/* Imágenes */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Reemplazar imágenes (Opcional)
                </p>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Imagen principal
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 1)}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Imagen secundaria
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 2)}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg shadow-xs transition flex items-center gap-2"
                >
                  {updating ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListaTours;
