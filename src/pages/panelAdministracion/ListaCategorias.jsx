import React, { useEffect, useState } from "react";
import axios from "axios";
import CardCategorias from "./CardCategorias";

function ListaCategorias() {
  const [categoriaData, setCategoriaData] = useState([]);
  const [categoriaEdit, setCategoriaEdit] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newImagenes, setNewImagenes] = useState({}); // { imagen1: File, imagen2: File, imagen3: File }
  const BASE_URL = "http://localhost:8080/categorias";

  // Obtener categorías
  const fetchCategorias = async () => {
    try {
      const { data } = await axios.get(BASE_URL);
      setCategoriaData(data);
      console.log("Respuesta del backend:", data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Eliminar categoría
  const handleDelete = async (id) => {
    try {
      const resultado = confirm("¿Estás seguro de eliminar esta categoría?");
      if (resultado) {
        await axios.delete(`${BASE_URL}/${id}`);
        setCategoriaData((prev) => prev.filter((cat) => cat.id !== id));
        alert("Categoría eliminada correctamente");
      } else {
        alert("Se ha cancelado el proceso de eliminacion")
      }
      
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      alert("No se pudo eliminar la categoría");
    }
  };

  // Abrir modal de edición
  const handleEdit = (categoria) => {
    setCategoriaEdit(categoria);
    setNewName(categoria.nombre);
    setNewDescripcion(categoria.descripcion);
    setNewImagenes({});
  };

  // Cambiar archivos en modal
  const handleFileChange = (e, imagenNum) => {
    const file = e.target.files[0] || null;
    setNewImagenes((prev) => ({
      ...prev,
      [`imagen${imagenNum}`]: file,
    }));
  };

  // Guardar cambios
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("nombre", newName);
      formData.append("descripcion", newDescripcion);

      // Adjuntar solo las imágenes nuevas
      Object.entries(newImagenes).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const { data } = await axios.put(
        `${BASE_URL}/${categoriaEdit.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
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

  // Cerrar modal
  const closeModal = () => setCategoriaEdit(null);

  return (
    <div className="p-4 relative">
      {/* Lista de categorías */}
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

      {/* Modal flotante */}
      {categoriaEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg animate-fadeIn">
            <h3 className="text-lg font-semibold mb-3 text-center">
              Editar Categoría
            </h3>

            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              placeholder="Nuevo nombre"
            />

            <input
              type="text"
              value={newDescripcion}
              onChange={(e) => setNewDescripcion(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              placeholder="Nueva descripción"
            />

            <small className="text-gray-500">Cambiar imagen principal</small>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 1)}
              className="border p-2 rounded w-full mb-2"
            />

            <small className="text-gray-500">Cambiar imagen secundaria</small>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 2)}
              className="border p-2 rounded w-full mb-2"
            />

            <small className="text-gray-500">Cambiar imagen terciaria</small>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 3)}
              className="border p-2 rounded w-full mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Guardar
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
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
