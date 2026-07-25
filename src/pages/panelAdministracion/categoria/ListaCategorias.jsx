import React, { useEffect, useState } from "react";
import axios from "axios";
import CardCategorias from "./CardCategorias";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function ListaCategorias() {
  const [categoriaData, setCategoriaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Estado para edición / modal
  const [categoriaEdit, setCategoriaEdit] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newImagenes, setNewImagenes] = useState({});
  const [updating, setUpdating] = useState(false);

  const BASE_URL = "https://backend-examen-dh.onrender.com/categorias";

  // ======================
  // OBTENER CATEGORÍAS
  // ======================
  const fetchCategorias = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data } = await axios.get(BASE_URL);
      setCategoriaData(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      setErrorMsg("No se pudieron cargar las categorías. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // ======================
  // ELIMINAR
  // ======================
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta categoría?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategoriaData((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      alert("No se pudo eliminar la categoría. Verifica tus permisos.");
    }
  };

  // ======================
  // PREPARAR EDICIÓN
  // ======================
  const handleEdit = (categoria) => {
    setCategoriaEdit(categoria);
    setNewName(categoria.nombre || "");
    setNewDescripcion(categoria.descripcion || "");
    setNewImagenes({});
  };

  // ======================
  // VALIDAR IMÁGENES
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

      // Mapear archivos a la clave "imagenes" que requiere el controlador Spring Boot
      Object.values(newImagenes).forEach((file) => {
        if (file) formData.append("imagenes", file);
      });

      const { data } = await axios.patch(
        `${BASE_URL}/${categoriaEdit.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Si el backend responde con un objeto actualizado o solo un mensaje string
      if (typeof data === "object" && data.id) {
        setCategoriaData((prev) =>
          prev.map((cat) => (cat.id === data.id ? data : cat)),
        );
      } else {
        // Refrescar lista si el backend responde con texto simple
        fetchCategorias();
      }

      closeModal();
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      alert(
        "No se pudo actualizar la categoría. Verifica los campos y tus permisos.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const closeModal = () => {
    setCategoriaEdit(null);
    setNewImagenes({});
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Encabezado de la Sección */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión de Categorías
          </h1>
          <p className="text-slate-500 text-sm">
            Administra, edita o elimina las categorías creadas en el sistema.
          </p>
        </div>
        <span className="self-start md:self-auto px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-full">
          Total: {categoriaData.length}
        </span>
      </div>

      {/* Estado de Carga */}
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
            Cargando categorías...
          </p>
        </div>
      )}

      {/* Notificación de Error */}
      {errorMsg && !loading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={fetchCategorias}
            className="text-xs underline font-semibold hover:text-red-900"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Grid de Categorías */}
      {!loading && !errorMsg && (
        <>
          {categoriaData.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-500 font-medium">
                No hay categorías disponibles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriaData.map((categoria) => (
                <CardCategorias
                  key={categoria.id}
                  categoriaData={categoria}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de Edición */}
      {categoriaEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-xl font-bold text-slate-900">
                Editar Categoría
              </h3>
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
                  Nombre
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm"
                  placeholder="Ej: Aventura"
                  required
                />
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
                  placeholder="Descripción de la categoría..."
                />
              </div>

              {/* Nuevas Imágenes */}
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

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Imagen terciaria
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 3)}
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

export default ListaCategorias;
