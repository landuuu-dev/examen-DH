import React, { useState } from 'react';
import axios from 'axios';

function CategoriasForm() {
  const [values, setValues] = useState({
    nombre: "",
    descripcion: "",
    imagen1: null, // obligatoria
    imagen2: null,
    imagen3: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: files[0] || null,
    }));
  };

  const handleForm = async (event) => {
    event.preventDefault();

    if (!values.nombre || !values.descripcion || !values.imagen1) {
      alert("Nombre, descripción y la primera imagen son obligatorios.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", values.nombre);
    formData.append("descripcion", values.descripcion);
    formData.append("imagen1", values.imagen1);
    if (values.imagen2) formData.append("imagen2", values.imagen2);
    if (values.imagen3) formData.append("imagen3", values.imagen3);

    try {
      const { data } = await axios.post("http://localhost:8080/categorias", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Categoría creada correctamente!");
      console.log("Nueva categoría:", data);

      // Reiniciar el formulario
      setValues({
        nombre: "",
        descripcion: "",
        imagen1: null,
        imagen2: null,
        imagen3: null,
      });
    } catch (error) {
      console.error("Error al crear la categoría:", error);
      alert("❌ No se pudo crear la categoría. Revisa la consola para más detalles.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Creación de Categorías</h1>

      <form onSubmit={handleForm} className="flex flex-col gap-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la categoría"
          value={values.nombre}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={values.descripcion}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <small className="text-gray-500">Imagen principal (obligatoria)</small>
        <input
          type="file"
          name="imagen1"
          accept="image/*"
          onChange={handleFileChange}
          className="border border-gray-300 rounded-md p-2 cursor-pointer"
        />

        <small className="text-gray-500">Imagen secundaria (opcional)</small>
        <input
          type="file"
          name="imagen2"
          accept="image/*"
          onChange={handleFileChange}
          className="border border-gray-300 rounded-md p-2 cursor-pointer"
        />

        <small className="text-gray-500">Imagen terciaria (opcional)</small>
        <input
          type="file"
          name="imagen3"
          accept="image/*"
          onChange={handleFileChange}
          className="border border-gray-300 rounded-md p-2 cursor-pointer"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white font-semibold py-3 rounded-md hover:bg-blue-600 transition-colors"
        >
          Crear categoría
        </button>
      </form>
    </div>
  );
}

export default CategoriasForm;
