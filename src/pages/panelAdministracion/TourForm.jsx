import React, { useState, useEffect } from "react";

function TourForm({ onTourCreado }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  // Nuevos campos obligatorios requeridos por la API
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cuposTotales, setCuposTotales] = useState("10");
  const [estado, setEstado] = useState("ACTIVO");

  const [categorias, setCategorias] = useState([]);
  const [imagenes, setImagenes] = useState(null);

  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const BACKEND_URL = "https://backend-examen-dh.onrender.com";

  useEffect(() => {
    fetch(`${BACKEND_URL}/categorias`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener categorías");
        return res.json();
      })
      .then((data) => {
        setCategorias(data);
        setLoadingCategorias(false);
      })
      .catch((err) => {
        console.error("Error al cargar categorías:", err);
        setLoadingCategorias(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoriaId) {
      setError("Debes seleccionar una categoría obligatoriamente.");
      return;
    }

    setLoading(true);
    setError(null);
    setMensaje(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Convertir el precio a número entero (int) para evitar 'Failed to convert property value'
      const precioInt = Math.round(parseFloat(precio));

      formData.append("nombre", nombre);
      formData.append("descripcion", descripcion);
      formData.append("precio", precioInt);
      formData.append("ubicacion", ubicacion);

      // Relación con categoría
      formData.append("categoriaId", categoriaId);
      formData.append("categoria.id", categoriaId);

      // Campos requeridos por Spring Boot
      formData.append("fechaInicio", fechaInicio);
      formData.append("fechaFin", fechaFin);
      formData.append("cuposTotales", parseInt(cuposTotales, 10));
      formData.append("estado", estado);

      // Adjuntar archivos de imagen
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
      setCategoriaId("");
      setFechaInicio("");
      setFechaFin("");
      setCuposTotales("10");
      setEstado("ACTIVO");
      setImagenes(null);

      e.target.reset();

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
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Creación de Tour
          </h2>
          <p className="text-slate-500 text-sm">
            Ingresa los detalles completos del paquete turístico.
          </p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Nombre del Tour <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Tour Machu Picchu Express"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Categoría */}
          <div>
            <label
              htmlFor="categoria"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              id="categoria"
              required
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition cursor-pointer capitalize"
            >
              <option value="" disabled>
                {loadingCategorias
                  ? "Cargando categorías..."
                  : "Selecciona una categoría"}
              </option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="descripcion"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="descripcion"
              rows="3"
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe las actividades del tour..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Precio y Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="precio"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Precio ($ USD Entero) <span className="text-red-500">*</span>
              </label>
              <input
                id="precio"
                type="number"
                step="1"
                required
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Ej: 150"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label
                htmlFor="ubicacion"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Ubicación <span className="text-red-500">*</span>
              </label>
              <input
                id="ubicacion"
                type="text"
                required
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej: Cusco, Perú"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Fechas de Inicio y Fin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fechaInicio"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Fecha Inicio <span className="text-red-500">*</span>
              </label>
              <input
                id="fechaInicio"
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label
                htmlFor="fechaFin"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Fecha Fin <span className="text-red-500">*</span>
              </label>
              <input
                id="fechaFin"
                type="date"
                required
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Cupos y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="cuposTotales"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Cupos Totales <span className="text-red-500">*</span>
              </label>
              <input
                id="cuposTotales"
                type="number"
                min="1"
                required
                value={cuposTotales}
                onChange={(e) => setCuposTotales(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label
                htmlFor="estado"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                id="estado"
                required
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition cursor-pointer"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="AGOTADO">AGOTADO</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>
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
          </div>

          {/* Botón Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || loadingCategorias}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg shadow-sm transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "Guardando tour..." : "Crear Tour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TourForm;
