import React, { useState, useEffect } from "react";

function EditTourModal({ tour, onClose, onTourActualizado }) {
  const formatForDateInput = (fechaStr) => {
    if (!fechaStr) return "";
    const str = String(fechaStr).split("T")[0];
    if (str.includes("-")) {
      const partes = str.split("-");
      if (partes[0].length === 2) {
        const [dia, mes, anio] = partes;
        return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
      }
    }
    return str;
  };

  const getCategoriaInicial = (t) => {
    if (!t) return "";
    if (typeof t.categoria === "object" && t.categoria?.id)
      return String(t.categoria.id);
    if (t.categoriaId) return String(t.categoriaId);
    if (typeof t.categoria === "string" || typeof t.categoria === "number")
      return String(t.categoria);
    return "";
  };

  // Campos principales
  const [nombre, setNombre] = useState(tour?.nombre || "");
  const [descripcion, setDescripcion] = useState(tour?.descripcion || "");
  const [precio, setPrecio] = useState(tour?.precio ?? "");
  const [ubicacion, setUbicacion] = useState(tour?.ubicacion || "");
  const [categoriaId, setCategoriaId] = useState(getCategoriaInicial(tour));

  const [fechaInicio, setFechaInicio] = useState(
    formatForDateInput(tour?.fechaInicio),
  );
  const [fechaFin, setFechaFin] = useState(formatForDateInput(tour?.fechaFin));
  const [cuposTotales, setCuposTotales] = useState(tour?.cuposTotales ?? 10);
  const [estado, setEstado] = useState(tour?.estado || "ACTIVO");

  // Estados para imágenes independientes
  const [filePrincipal, setFilePrincipal] = useState(null);
  const [fileSecundaria1, setFileSecundaria1] = useState(null);
  const [fileSecundaria2, setFileSecundaria2] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loading, setLoading] = useState(false);
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

        const initialCatId = getCategoriaInicial(tour);
        if (!initialCatId && tour?.nombreCategoria) {
          const encontrada = data.find(
            (c) =>
              c.nombre.toLowerCase() === tour.nombreCategoria.toLowerCase(),
          );
          if (encontrada) setCategoriaId(String(encontrada.id));
        }
      })
      .catch((err) => {
        console.error("Error al cargar categorías:", err);
        setLoadingCategorias(false);
      });
  }, [tour]);

  useEffect(() => {
    if (tour) {
      setNombre(tour.nombre || "");
      setDescripcion(tour.descripcion || "");
      setPrecio(tour.precio ?? "");
      setUbicacion(tour.ubicacion || "");
      setFechaInicio(formatForDateInput(tour.fechaInicio));
      setFechaFin(formatForDateInput(tour.fechaFin));
      setCuposTotales(tour.cuposTotales ?? 10);
      setEstado(tour.estado || "ACTIVO");

      const catId = getCategoriaInicial(tour);
      if (catId) {
        setCategoriaId(catId);
      }
    }
  }, [tour]);

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

      const precioInt = Math.round(parseFloat(precio));

      formData.append("nombre", nombre);
      formData.append("descripcion", descripcion);
      formData.append("precio", precioInt);
      formData.append("ubicacion", ubicacion);
      formData.append("categoriaId", categoriaId);
      formData.append("fechaInicio", fechaInicio);
      formData.append("fechaFin", fechaFin);
      formData.append("cuposTotales", parseInt(cuposTotales, 10));
      formData.append("estado", estado);

      // 1. Enviamos solo los archivos que el usuario seleccionó
      // Usamos el mismo nombre de parámetro 'imagenes' para mantener compatibilidad,
      // pero garantizamos que se envíen en un orden estricto mediante la lista.
      const imagenesAEnviar = [
        filePrincipal,
        fileSecundaria1,
        fileSecundaria2,
      ].filter(Boolean);

      imagenesAEnviar.forEach((file) => {
        formData.append("imagenes", file);
      });

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

  const imagenesActuales = tour?.imagenes || tour?.imagenesUrl || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col relative overflow-hidden">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer z-10"
        >
          ✕
        </button>

        <div className="p-6 md:px-8 border-b border-slate-100 bg-white">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Editar Tour
          </h2>
          <p className="text-slate-500 text-sm">
            Modifica los detalles del paquete o actualiza sus imágenes.
          </p>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto space-y-5">
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
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-precio"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Precio ($ USD) <span className="text-red-500">*</span>
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

            {/* Sección de imágenes */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Fotografías del Tour (Reemplaza solo los campos necesarios)
              </label>

              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label
                    htmlFor="edit-img-principal"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    1. Imagen Principal (Portada)
                  </label>
                  {imagenesActuales[0] && (
                    <div className="mb-2 flex items-center gap-2">
                      <img
                        src={imagenesActuales[0]}
                        alt="Principal actual"
                        className="w-12 h-12 object-cover rounded-md border"
                      />
                      <span className="text-xs text-slate-500">
                        Actual en servidor
                      </span>
                    </div>
                  )}
                  <input
                    id="edit-img-principal"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFilePrincipal(e.target.files[0] || null)
                    }
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label
                    htmlFor="edit-img-sec1"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    2. Imagen Secundaria 1
                  </label>
                  {imagenesActuales[1] && (
                    <div className="mb-2 flex items-center gap-2">
                      <img
                        src={imagenesActuales[1]}
                        alt="Secundaria 1 actual"
                        className="w-12 h-12 object-cover rounded-md border"
                      />
                      <span className="text-xs text-slate-500">
                        Actual en servidor
                      </span>
                    </div>
                  )}
                  <input
                    id="edit-img-sec1"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFileSecundaria1(e.target.files[0] || null)
                    }
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label
                    htmlFor="edit-img-sec2"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    3. Imagen Secundaria 2
                  </label>
                  {imagenesActuales[2] && (
                    <div className="mb-2 flex items-center gap-2">
                      <img
                        src={imagenesActuales[2]}
                        alt="Secundaria 2 actual"
                        className="w-12 h-12 object-cover rounded-md border"
                      />
                      <span className="text-xs text-slate-500">
                        Actual en servidor
                      </span>
                    </div>
                  )}
                  <input
                    id="edit-img-sec2"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFileSecundaria2(e.target.files[0] || null)
                    }
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

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
