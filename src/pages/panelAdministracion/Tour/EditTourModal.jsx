import React, { useState, useEffect } from "react";

function EditTourModal({ tour, onClose, onTourActualizado }) {
  // Obtener el ID inicial de la categoría
  const categoriaInicialId =
    typeof tour?.categoria === "object"
      ? tour?.categoria?.id
      : tour?.categoriaId || tour?.categoria || "";

  // Campos principales
  const [nombre, setNombre] = useState(tour?.nombre || "");
  const [descripcion, setDescripcion] = useState(tour?.descripcion || "");
  const [precio, setPrecio] = useState(tour?.precio ?? "");
  const [ubicacion, setUbicacion] = useState(tour?.ubicacion || "");
  const [categoriaId, setCategoriaId] = useState(categoriaInicialId);

  // Campos requeridos por las validaciones de Spring Boot
  const [fechaInicio, setFechaInicio] = useState(
    tour?.fechaInicio ? tour.fechaInicio.substring(0, 10) : "",
  );
  const [fechaFin, setFechaFin] = useState(
    tour?.fechaFin ? tour.fechaFin.substring(0, 10) : "",
  );
  const [cuposTotales, setCuposTotales] = useState(tour?.cuposTotales ?? 10);
  const [estado, setEstado] = useState(tour?.estado || "ACTIVO");

  const [categorias, setCategorias] = useState([]);
  const [imagenes, setImagenes] = useState(null);

  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = "https://backend-examen-dh.onrender.com";

  // Cargar categorías disponibles desde la API
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

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Convertir el precio a número entero (int) exigido por el DTO
      const precioInt = Math.round(parseFloat(precio));

      formData.append("nombre", nombre);
      formData.append("descripcion", descripcion);
      formData.append("precio", precioInt);
      formData.append("ubicacion", ubicacion);

      // Relación con categoría
      formData.append("categoriaId", categoriaId);
      formData.append("categoria.id", categoriaId);

      // Nuevos campos obligatorios requeridos por Spring Boot
      formData.append("fechaInicio", fechaInicio);
      formData.append("fechaFin", fechaFin);
      formData.append("cuposTotales", parseInt(cuposTotales, 10));
      formData.append("estado", estado);

      // Adjuntar imágenes si se seleccionaron
      if (imagenes && imagenes.length > 0) {
        Array.from(imagenes).forEach((file) => {
          formData.append("imagenes", file);
        });
      }

      const res = await fetch(`${BACKEND_URL}/tours/${tour.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Error al actualizar el tour");
      }

      if (onTourActualizado) {
        onTourActualizado();
      }
      onClose();
    } catch (err) {
      setError(err.message || "Ocurrió un error al actualizar el tour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Tarjeta del Modal con restricción de alto máximo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Botón cerrar modal */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer z-10"
        >
          ✕
        </button>

        {/* Encabezado Fijo */}
        <div className="p-6 md:px-8 border-b border-slate-100 bg-white">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Editar Tour
          </h2>
          <p className="text-slate-500 text-sm">
            Modifica los detalles del paquete o cambia su categoría asignada.
          </p>
        </div>

        {/* Cuerpo con Scroll para el Formulario */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-5">
          {/* Notificación de Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
              <span className="font-medium">{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-700 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <form
            id="edit-tour-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Nombre */}
            <div>
              <label
                htmlFor="edit-nombre"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Nombre del Tour <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
              />
            </div>

            {/* Categoría */}
            <div>
              <label
                htmlFor="edit-categoria"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="edit-categoria"
                required
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200 cursor-pointer capitalize"
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
                htmlFor="edit-descripcion"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="edit-descripcion"
                rows="3"
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
              />
            </div>

            {/* Precio y Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-precio"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Precio ($ USD Entero) <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-precio"
                  type="number"
                  step="1"
                  required
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-ubicacion"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Ubicación <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-ubicacion"
                  type="text"
                  required
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
                />
              </div>
            </div>

            {/* Fechas de Inicio y Fin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-fechaInicio"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Fecha Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-fechaInicio"
                  type="date"
                  required
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-fechaFin"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Fecha Fin <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-fechaFin"
                  type="date"
                  required
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
                />
              </div>
            </div>

            {/* Cupos y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-cuposTotales"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Cupos Totales <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-cuposTotales"
                  type="number"
                  min="1"
                  required
                  value={cuposTotales}
                  onChange={(e) => setCuposTotales(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-estado"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-estado"
                  required
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200 cursor-pointer"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="AGOTADO">AGOTADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>
            </div>

            {/* Imágenes opcionales */}
            <div>
              <label
                htmlFor="edit-imagenes"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Reemplazar/Añadir Imágenes (opcional)
              </label>
              <input
                id="edit-imagenes"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImagenes(e.target.files)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer bg-slate-50 rounded-lg border border-slate-200 p-1.5"
              />
            </div>
          </form>
        </div>

        {/* Pie Fijo con Botones de Acción */}
        <div className="p-4 md:px-8 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition duration-200 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="edit-tour-form"
            disabled={loading || loadingCategorias}
            className="w-1/2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg shadow-sm transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditTourModal;
