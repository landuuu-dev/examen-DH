import React, { useEffect, useState } from "react";
import axios from "axios";
import CardCategorias from "./CardCategorias";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function ListaCategorias() {
  const [categoriaData, setCategoriaData] = useState([]);
  const [categoriaEdit, setCategoriaEdit] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newImagenes, setNewImagenes] = useState({});
  const BASE_URL = "https://backend-examen-dh.onrender.com/categorias";

  // ======================
  // OBTENER CATEGORÍAS
  // ======================
  const fetchCategorias = async () => {
    try {
      const { data } = await axios.get(BASE_URL);
      setCategoriaData(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // ======================
  // ELIMINAR
  // ======================
  const handleDelete = async (id) => {
    try {
      if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

      await axios.delete(`${BASE_URL}/${id}`);
      setCategoriaData((prev) => prev.filter((cat) => cat.id !== id));
      alert("Categoría eliminada correctamente");
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      alert("No se pudo eliminar la categoría");
    }
  };

  // ======================
  // EDITAR
  // ======================
  const handleEdit = (categoria) => {
    setCategoriaEdit(categoria);
    setNewName(categoria.nombre);
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
      alert("Solo se permiten imágenes");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("La imagen no puede superar los 5 MB");
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
  const handleUpdate = async () => {
    try {
      if (
        newName === categoriaEdit.nombre &&
        newDescripcion === categoriaEdit.descripcion &&
        Object.keys(newImagenes).length === 0
      ) {
        alert("No hay cambios para guardar");
        return;
      }

      const formData = new FormData();
      if (newName) formData.append("nombre", newName);
      if (newDescripcion) formData.append("descripcion", newDescripcion);

      Object.entries(newImagenes).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const { data } = await axios.patch(
        `${BASE_URL}/${categoriaEdit.id}`,
        formData
      );

      setCategoriaData((prev) =>
        prev.map((cat) => (cat.id === data.id ? data : cat))
      );

      alert("Categoría actualizada con éxito");
      setCategoriaEdit(null);
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      alert("No se pudo actualizar la categoría");
    }
  };

  // ======================
  // CERRAR MODAL
  // ======================
  const closeModal = () => setCategoriaEdit(null);

  return (
    <div className="p-4 relative">
      <div className="grid grid-cols-3 gap-4">
        {categoriaData.length === 0 ? (
          <p>No hay categorías disponibles.</p>
        ) : (
          categoriaData.map((categoria) => (
            <CardCategorias
              key={categoria.id}
              categoriaData={categoria}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {categoriaEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-3 text-center">
              Editar Categoría
            </h3>

            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              placeholder="Nombre"
            />

            <input
              type="text"
              value={newDescripcion}
              onChange={(e) => setNewDescripcion(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              placeholder="Descripción"
            />

            <small>Cambiar imagen principal</small>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 1)}
              className="border p-2 rounded w-full mb-2"
            />

            <small>Cambiar imagen secundaria</small>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 2)}
              className="border p-2 rounded w-full mb-2"
            />

            <small>Cambiar imagen terciaria</small>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 3)}
              className="border p-2 rounded w-full mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListaCategorias;
