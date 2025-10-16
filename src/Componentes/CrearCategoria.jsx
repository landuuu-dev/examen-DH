import React, { useState } from "react";
import axios from "axios";

function CrearCategoria({ onCategoriaCreada }) {
  const [nombre, setNombre] = useState("");
  const API_URL = "http://localhost:8080/categorias";

  // 🔹 Crear nueva categoría
  const crearCategoria = async () => {
    if (!nombre.trim()) return;

    try {
      const res = await axios.post(API_URL, { nombre });
      setNombre("");
      
      // Llamamos al callback si existe
      if (onCategoriaCreada) {
        onCategoriaCreada(res.data); // opcional: enviamos la nueva categoría
      }

    } catch (error) {
      console.error("Error al crear categoría:", error);
    }
  };

  // 🔹 Eliminar categoría (opcional si quieres mantenerlo)
  const eliminarCategoria = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta categoría?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      // Podrías llamar a onCategoriaCreada() también para actualizar lista en PanelAdmin
      if (onCategoriaCreada) {
        onCategoriaCreada();
      }
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-lg mt-4">
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-4">
        Crear Categoría
      </h1>

      {/* Formulario */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Nombre de categoría"
          className="border p-2 rounded flex-1"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button
          onClick={crearCategoria}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Crear
        </button>
      </div>
    </div>
  );
}

export default CrearCategoria;
