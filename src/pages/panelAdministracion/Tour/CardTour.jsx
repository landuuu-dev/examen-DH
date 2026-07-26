import React, { useState, useEffect } from "react";

export default function CardTour({ tourData, tour, onDelete, onEdit }) {
  // 1. Compatibilidad para recibir 'tourData' o 'tour'
  const data = tourData || tour;

  const [totalInscritos, setTotalInscritos] = useState(0);
  const [listaInscritos, setListaInscritos] = useState([]);
  const [cargandoInscritos, setCargandoInscritos] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [correoCopiado, setCorreoCopiado] = useState(null);

  const BACKEND_URL = "https://backend-examen-dh.onrender.com";

  // 2. Fetch automático de inscritos por ID del Tour
  useEffect(() => {
    if (!data?.id) return;

    const obtenerInscritos = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BACKEND_URL}/tours/${data.id}/inscritos`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (res.ok) {
          const resData = await res.json();
          if (Array.isArray(resData)) {
            setListaInscritos(resData);
            setTotalInscritos(resData.length);
          }
        }
      } catch (error) {
        console.error("Error al obtener inscritos:", error);
      } finally {
        setCargandoInscritos(false);
      }
    };

    obtenerInscritos();
  }, [data?.id]);

  const copiarAlPortapapeles = async (texto) => {
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
      setCorreoCopiado(texto);
      setTimeout(() => setCorreoCopiado(null), 2000);
    } catch (err) {
      console.error("Error al copiar correo:", err);
    }
  };

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return null;
    try {
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(fechaIso));
    } catch {
      return null;
    }
  };

  // Skeleton Loader si no hay datos
  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
        <div className="w-full h-48 bg-slate-200 rounded-xl mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
      </div>
    );
  }

  // Lógica de lectura de imágenes
  const obtenerListaImagenes = () => {
    if (Array.isArray(data.imagenes) && data.imagenes.length > 0)
      return data.imagenes;
    if (Array.isArray(data.images) && data.images.length > 0)
      return data.images;
    if (data.imagen1 || data.imagen2 || data.imagen3) {
      return [data.imagen1, data.imagen2, data.imagen3].filter(Boolean);
    }
    if (typeof data.imagen === "string") return [data.imagen];
    return [];
  };

  const listaImagenes = obtenerListaImagenes();

  const formatUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    return url.startsWith("/") ? `${BACKEND_URL}${url}` : url;
  };

  const imagenPrincipal = formatUrl(listaImagenes[0]);
  const tituloTour = data.nombre || data.title || "Tour sin título";
  const descripcionTour = data.descripcion || "Sin descripción disponible.";

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group h-full">
        <div>
          {/* Imagen Principal */}
          <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
            {imagenPrincipal ? (
              <img
                src={imagenPrincipal}
                alt={tituloTour}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/600x400/e2e8f0/475569?text=Sin+Imagen";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                Sin imagen disponible
              </div>
            )}

            <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/70 backdrop-blur-xs text-white text-xs font-mono rounded-full shadow-xs">
              #{String(data.id || "").slice(-4)}
            </span>

            {data.categoriaNombre && (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500/90 text-white text-xs font-medium rounded-full shadow-xs">
                {data.categoriaNombre}
              </span>
            )}
          </div>

          {/* Contenido */}
          <div className="p-5">
            <h3 className="text-xl font-bold text-slate-900 capitalize line-clamp-1 mb-2">
              {tituloTour}
            </h3>

            {/* Badge de Inscritos */}
            <div className="mb-3">
              <button
                type="button"
                onClick={() => totalInscritos > 0 && setModalAbierto(true)}
                disabled={cargandoInscritos || totalInscritos === 0}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition duration-200 ${
                  totalInscritos > 0
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100 cursor-pointer"
                    : "bg-slate-100 text-slate-500 border border-slate-200 cursor-default"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cargandoInscritos
                  ? "Cargando..."
                  : `Ver inscritos (${totalInscritos})`}
              </button>
            </div>

            <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">
              {descripcionTour}
            </p>
          </div>
        </div>

        {/* Botones Modificar/Eliminar */}
        {(onEdit || onDelete) && (
          <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
            {onEdit && (
              <button
                onClick={() => onEdit(data)}
                className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-700 text-sm font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(data.id)}
                className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-200/80 text-red-600 text-sm font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Inscritos */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Usuarios Inscritos
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {tituloTour}
                </p>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition duration-150 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto divide-y divide-slate-100">
              {listaInscritos.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-4">
                  No hay inscritos registrados.
                </p>
              ) : (
                listaInscritos.map((item, index) => {
                  // Mapeo directo al JSON de tu backend (nombreUsuario contiene el email)
                  const correo =
                    item.nombreUsuario ||
                    item.usuarioCorreo ||
                    item.correo ||
                    item.email ||
                    "Correo no disponible";

                  const nombre =
                    correo !== "Correo no disponible" && correo.includes("@")
                      ? correo.split("@")[0]
                      : `Inscrito #${index + 1}`;

                  const fechaFormatted = formatearFecha(item.fechaInscripcion);

                  return (
                    <div
                      key={item.id || index}
                      className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate capitalize">
                          {nombre}
                        </p>
                        <p className="text-xs text-slate-500 truncate font-mono">
                          {correo}
                        </p>
                        {fechaFormatted && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Inscrito el {fechaFormatted}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => copiarAlPortapapeles(correo)}
                        title="Copiar correo"
                        className={`p-2 rounded-lg border transition duration-150 flex items-center justify-center cursor-pointer ${
                          correoCopiado === correo
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                        }`}
                      >
                        {correoCopiado === correo ? "✓" : "📋"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition duration-150 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
