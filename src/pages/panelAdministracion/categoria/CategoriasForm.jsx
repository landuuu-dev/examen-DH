import React, { useState } from "react";
import axios from "axios";
import ImageUploader from "./ImagenUploader";

function CategoriasForm() {
  const [values, setValues] = useState({
    nombre: "",
    descripcion: "",
    imagen1: null,
    imagen2: null,
    imagen3: null,
  });

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

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
    setMensaje(null);
    setError(null);

    if (!values.nombre || !values.descripcion || !values.imagen1) {
      setError(
        "El nombre, la descripción y la primera imagen son obligatorios.",
      );
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Campos de texto para el CategoriaRequest (@ModelAttribute)
      formData.append("nombre", values.nombre);
      formData.append("descripcion", values.descripcion);

      // Agrupar todas las imágenes bajo la clave "imagenes" que espera Spring Boot
      if (values.imagen1) formData.append("imagenes", values.imagen1);
      if (values.imagen2) formData.append("imagenes", values.imagen2);
      if (values.imagen3) formData.append("imagenes", values.imagen3);

      const { data } = await axios.post(
        "https://backend-examen-dh.onrender.com/categorias",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Header de seguridad requerido
          },
        },
      );

      setMensaje("¡Categoría creada correctamente!");
      console.log("Respuesta servidor:", data);

      // Reiniciar formulario
      setValues({
        nombre: "",
        descripcion: "",
        imagen1: null,
        imagen2: null,
        imagen3: null,
      });
    } catch (err) {
      console.error("Error detallado al crear la categoría:", err);

      // Capturar respuesta exacta del backend si está disponible
      const serverError =
        err.response?.data?.message || err.response?.data || err.message;
      setError(
        typeof serverError === "string"
          ? serverError
          : "No se pudo crear la categoría. Verifica que tengas permisos de Administrador.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        {/* Encabezado */}
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Creación de Categorías
          </h2>
          <p className="text-slate-500 text-sm">
            Registra una nueva categoría para organizar los tours disponibles.
          </p>
        </div>

        {/* Notificación de Éxito */}
        {mensaje && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center justify-between">
            <span className="font-medium">{mensaje}</span>
            <button
              onClick={() => setMensaje(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Notificación de Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
            <span className="font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleForm} className="space-y-5">
          {/* Nombre */}
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Nombre de la Categoría
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Ej: Aventura, Playa, Cultural"
              value={values.nombre}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
            />
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="descripcion"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows="3"
              placeholder="Escribe una breve descripción para la categoría..."
              value={values.descripcion}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
            />
          </div>

          {/* Carga de Imágenes */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Imagen principal <span className="text-red-500">*</span>
              </label>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <ImageUploader
                  name="imagen1"
                  handleFileChange={handleFileChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Imagen secundaria{" "}
                <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <ImageUploader
                  name="imagen2"
                  handleFileChange={handleFileChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Imagen terciaria{" "}
                <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <ImageUploader
                  name="imagen3"
                  handleFileChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          {/* Botón */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg shadow-sm active:scale-[0.98] transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  <span>Creando categoría...</span>
                </>
              ) : (
                "Crear categoría"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoriasForm;
