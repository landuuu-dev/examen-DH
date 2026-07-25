import React, { useState } from "react";

function TourForm({ onTourCreado }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [imagenes, setImagenes] = useState(null);

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const BACKEND_URL = "https://backend-examen-dh.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMensaje(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("nombre", nombre);
      formData.append("descripcion", descripcion);
      formData.append("precio", precio);
      formData.append("ubicacion", ubicacion);

      // Adjuntar archivos de imagen si existen
      if (imagenes && imagenes.length > 0) {
        Array.from(imagenes).forEach((file) => {
          formData.append("imagenes", file);
        });
      }

      const res = await fetch(`${BACKEND_URL}/tours`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Error al crear el tour");
      }

      setMensaje("¡Tour creado con éxito!");

      // Limpiar formulario
      setNombre("");
      setDescripcion("");
      setPrecio("");
      setUbicacion("");
      setImagenes(null);

      // Limpiar input de archivo
      e.target.reset();

      // Notificar al componente padre si se requiere recargar listas
      if (onTourCreado) onTourCreado();
    } catch (err) {
      setError(err.message || "Ocurrió un error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        {/* Encabezado del Formulario */}
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Creación de Tour
          </h2>
          <p className="text-slate-500 text-sm">
            Ingresa los detalles del nuevo paquete o destino turístico.
          </p>
        </div>

        {/* Notificación de Éxito */}
        {mensaje && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center justify-between">
            <span className="font-medium">{mensaje}</span>
            <button
              onClick={() => setMensaje(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
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
              className="text-red-700 hover:text-red-900 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre del Tour */}
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Nombre del Tour
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Tour Machu Picchu Express"
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
              rows="4"
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe las actividades, itinerario e inclusiones del tour..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
            />
          </div>

          {/* Precio y Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="precio"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Precio ($ USD)
              </label>
              <input
                id="precio"
                type="number"
                step="0.01"
                required
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="ubicacion"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Ubicación
              </label>
              <input
                id="ubicacion"
                type="text"
                required
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej: Cusco, Perú"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
              />
            </div>
          </div>

          {/* Selección de Imágenes */}
          <div>
            <label
              htmlFor="imagenes"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Imágenes del Tour
            </label>
            <input
              id="imagenes"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImagenes(e.target.files)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer bg-slate-50 rounded-lg border border-slate-200 p-1.5"
            />
            <p className="text-slate-400 text-xs mt-1.5">
              Puedes seleccionar varias imágenes al mismo tiempo.
            </p>
          </div>

          {/* Botón Guardar */}
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
                  <span>Guardando tour...</span>
                </>
              ) : (
                "Crear Tour"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TourForm;
