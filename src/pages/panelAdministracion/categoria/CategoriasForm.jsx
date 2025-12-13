import React, { useState } from 'react';
import axios from 'axios';
import ImageUploader from './ImagenUploader';

function CategoriasForm() {

  const [values, setValues] = useState({
    nombre: "",
    descripcion: "",
    imagen1: null,
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
      const { data } = await axios.post(
        "https://backend-examen-dh.onrender.com/categorias",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Categoría creada correctamente!");
      console.log("Nueva categoría:", data);

      // Reiniciar formulario
      setValues({
        nombre: "",
        descripcion: "",
        imagen1: null,
        imagen2: null,
        imagen3: null,
      });

    } catch (error) {
      console.error("Error al crear la categoría:", error);
      alert("❌ No se pudo crear la categoría.");
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
          className="border border-gray-300 rounded-md p-3"
        />

        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={values.descripcion}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-3"
        />

        <small className="text-gray-500">Imagen principal (obligatoria)</small>
        <ImageUploader name="imagen1" handleFileChange={handleFileChange} />

        <small className="text-gray-500">Imagen secundaria (opcional)</small>
        <ImageUploader name="imagen2" handleFileChange={handleFileChange} />

        <small className="text-gray-500">Imagen terciaria (opcional)</small>
        <ImageUploader name="imagen3" handleFileChange={handleFileChange} />

        <button
          type="submit"
          className="bg-blue-500 text-white font-semibold py-3 rounded-md"
        >
          Crear categoría
        </button>
      </form>
    </div>
  );
}

export default CategoriasForm;
