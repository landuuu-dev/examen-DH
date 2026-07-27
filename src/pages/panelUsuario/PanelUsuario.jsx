import React, { useState, useEffect } from "react";
import TarjetaTour from "./TarjetaTour";
import DetalleTourModal from "./DetalleTourModal";

export default function PanelUsuario() {
  const [usuario] = useState(() => {
    try {
      const u = localStorage.getItem("usuario");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [token] = useState(() => localStorage.getItem("token") || "");
  const [misFavoritos, setMisFavoritos] = useState([]);
  const [toursInscritos, setToursInscritos] = useState([]);
  const [misInscripcionesIds, setMisInscripcionesIds] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoTourId, setProcesandoTourId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tourSeleccionado, setTourSeleccionado] = useState(null);

  const BACKEND_URL = "https://backend-examen-dh.onrender.com";
  const userId = usuario?.id || usuario?._id || usuario?.idUsuario;

  const getImagenUrl = (img) => {
    if (!img) return "https://via.placeholder.com/300x200?text=Sin+Imagen";
    if (typeof img === "string") {
      if (img.startsWith("http://") || img.startsWith("https://")) return img;
      return `${BACKEND_URL}${img.startsWith("/") ? "" : "/"}${img}`;
    }
    if (typeof img === "object" && img.url) {
      if (img.url.startsWith("http://") || img.url.startsWith("https://"))
        return img.url;
      return `${BACKEND_URL}${img.url.startsWith("/") ? "" : "/"}${img.url}`;
    }
    return "https://via.placeholder.com/300x200?text=Sin+Imagen";
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return null;
    try {
      const d = new Date(fechaStr);
      if (isNaN(d.getTime())) return fechaStr;
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return fechaStr;
    }
  };

  const obtenerFechasTour = (tour) => {
    if (!tour) return "Fecha no especificada";
    if (tour.fechaInicio && tour.fechaFin) {
      return `${formatearFecha(tour.fechaInicio)} - ${formatearFecha(tour.fechaFin)}`;
    }
    if (tour.fechaInicio) return formatearFecha(tour.fechaInicio);
    if (tour.fecha) return formatearFecha(tour.fecha);
    if (tour.fechas) return tour.fechas;
    return "Fechas a confirmar";
  };

  const obtenerCuposTour = (tour) => {
    if (!tour) return null;
    if (tour.cuposDisponibles !== undefined) return tour.cuposDisponibles;
    if (tour.disponibles !== undefined) return tour.disponibles;
    if (tour.cupos !== undefined) return tour.cupos;
    if (tour.capacidad !== undefined) return tour.capacidad;
    return null;
  };

  useEffect(() => {
    if (!token || !userId) {
      setCargando(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        setErrorMsg(null);
        setCargando(true);

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [resFavs, resInsc, resTodosTours] = await Promise.all([
          fetch(`${BACKEND_URL}/usuarios/${userId}/favoritos`, { headers }),
          fetch(`${BACKEND_URL}/usuarios/${userId}/mis-inscripciones`, {
            headers,
          }),
          fetch(`${BACKEND_URL}/tours`, { headers }),
        ]);

        if (!resFavs.ok) throw new Error("Error al cargar favoritos.");

        const dataFavs = await resFavs.json();
        setMisFavoritos(Array.isArray(dataFavs) ? dataFavs : []);

        let todosLosTours = [];
        if (resTodosTours.ok) {
          todosLosTours = await resTodosTours.json();
        }

        if (resInsc.ok) {
          const dataInsc = await resInsc.json();
          if (Array.isArray(dataInsc)) {
            const ids = dataInsc.map(
              (item) => item.tourId || item.idTour || item.id || item._id,
            );
            setMisInscripcionesIds(ids.filter(Boolean));

            const toursCompletosInscritos = dataInsc.map((inscripcion) => {
              const targetId =
                inscripcion.tourId ||
                inscripcion.idTour ||
                inscripcion.id ||
                inscripcion._id;
              const tourEncontrado = todosLosTours.find(
                (t) => (t.id || t._id) === targetId,
              );

              return (
                tourEncontrado || {
                  id: targetId,
                  nombre: inscripcion.nombreTour || "Tour sin título",
                  descripcion: "Inscripción confirmada",
                  precio: 0,
                  ubicacion: "General",
                  imagenes: [],
                }
              );
            });

            setToursInscritos(toursCompletosInscritos);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setErrorMsg(err.message || "No se pudieron cargar tus datos.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [userId, token]);

  const handleQuitarFavorito = async (e, tourId) => {
    if (e) e.stopPropagation();
    if (!token || !userId) return;

    setMisFavoritos((prev) => prev.filter((t) => (t.id || t._id) !== tourId));

    try {
      await fetch(`${BACKEND_URL}/usuarios/${userId}/favoritos/${tourId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Error al eliminar favorito:", err);
    }
  };

  const handleToggleInscripcion = async (e, tour) => {
    if (e) e.stopPropagation();
    if (!token) return;

    const tourId = tour?.id || tour?._id;
    if (!tourId) return;

    const estaInscrito = misInscripcionesIds.includes(tourId);
    setProcesandoTourId(tourId);

    try {
      const url = estaInscrito
        ? `${BACKEND_URL}/tours/${tourId}/desinscribirse`
        : `${BACKEND_URL}/tours/${tourId}/inscribir`;

      const method = estaInscrito ? "DELETE" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo procesar la inscripción.");
      }

      if (estaInscrito) {
        setMisInscripcionesIds((prev) => prev.filter((id) => id !== tourId));
        setToursInscritos((prev) =>
          prev.filter((t) => (t.id || t._id) !== tourId),
        );
      } else {
        setMisInscripcionesIds((prev) => [...prev, tourId]);
        setToursInscritos((prev) => {
          const yaExiste = prev.some((t) => (t.id || t._id) === tourId);
          return yaExiste ? prev : [...prev, tour];
        });
      }
    } catch (err) {
      console.error("Error en la inscripción:", err);
      alert(err.message || "Ocurrió un error al procesar tu solicitud.");
    } finally {
      setProcesandoTourId(null);
    }
  };

  if (!token || !usuario) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-md shadow-xs">
          <h2 className="text-2xl font-bold text-amber-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-amber-700">
            Por favor, inicia sesión para acceder a tu panel de usuario.
          </p>
        </div>
      </div>
    );
  }

  if (tourSeleccionado) {
    const tourIdActual = tourSeleccionado.id || tourSeleccionado._id;
    return (
      <DetalleTourModal
        tour={tourSeleccionado}
        estaInscrito={misInscripcionesIds.includes(tourIdActual)}
        estaProcesando={procesandoTourId === tourIdActual}
        onVolver={() => setTourSeleccionado(null)}
        onToggleInscripcion={handleToggleInscripcion}
        getImagenUrl={getImagenUrl}
        obtenerFechasTour={obtenerFechasTour}
        obtenerCuposTour={obtenerCuposTour}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-indigo-700 text-white font-bold text-3xl flex items-center justify-center shadow-xs shrink-0">
          {usuario?.correo ? usuario.correo.charAt(0).toUpperCase() : "U"}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Mi Cuenta</h2>
          <p className="text-slate-700 text-sm">
            <strong className="font-semibold text-slate-900">Correo:</strong>{" "}
            {usuario?.correo}
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase tracking-wider">
              {usuario?.rol || "USER"}
            </span>
          </div>
        </div>
      </section>

      {/* SECCIÓN 1: MIS TOURS INSCRITOS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            🎟️ Mis Tours Inscritos
          </h3>
          {!cargando && !errorMsg && (
            <span className="text-sm font-semibold text-slate-600 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              {toursInscritos.length}{" "}
              {toursInscritos.length === 1
                ? "inscripción activa"
                : "inscripciones activas"}
            </span>
          )}
        </div>

        {cargando && (
          <div className="flex justify-center items-center py-8">
            <p className="animate-pulse text-indigo-700 font-bold flex items-center gap-2">
              <span>⏳</span> Cargando tus inscripciones...
            </p>
          </div>
        )}

        {!cargando && !errorMsg && toursInscritos.length === 0 && (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
            <span className="text-4xl mb-2 block">🎫</span>
            <p className="text-slate-700 font-bold">
              No estás inscrito en ningún tour por el momento.
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Revisa nuestras recomendaciones e inscríbete a tu próxima
              aventura.
            </p>
          </div>
        )}

        {!cargando && toursInscritos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {toursInscritos.map((tour, index) => {
              const tourId = tour?.id || tour?._id || index;
              return (
                <TarjetaTour
                  key={`inscrito-${tourId}-${index}`}
                  tour={tour}
                  tipo="inscrito"
                  estaInscrito={true}
                  procesando={procesandoTourId === tourId}
                  onSelectTour={setTourSeleccionado}
                  onToggleInscripcion={handleToggleInscripcion}
                  onQuitarFavorito={handleQuitarFavorito}
                  getImagenUrl={getImagenUrl}
                  obtenerFechasTour={obtenerFechasTour}
                  obtenerCuposTour={obtenerCuposTour}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: MIS TOURS FAVORITOS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            ❤️ Mis Tours Favoritos
          </h3>
          {!cargando && !errorMsg && (
            <span className="text-sm font-semibold text-slate-600 bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
              {misFavoritos.length}{" "}
              {misFavoritos.length === 1 ? "guardado" : "guardados"}
            </span>
          )}
        </div>

        {cargando && (
          <div className="flex justify-center items-center py-8">
            <p className="animate-pulse text-indigo-700 font-bold flex items-center gap-2">
              <span>⏳</span> Cargando tus favoritos...
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-medium">
            <p>Ocurrió un problema: {errorMsg}</p>
          </div>
        )}

        {!cargando && !errorMsg && misFavoritos.length === 0 && (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
            <span className="text-4xl mb-2 block">💔</span>
            <p className="text-slate-700 font-bold">
              Aún no has guardado ningún tour en tus favoritos.
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Explora nuestro catálogo y guarda los que más te gusten.
            </p>
          </div>
        )}

        {!cargando && misFavoritos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {misFavoritos.map((tour, index) => {
              const tourId = tour?.id || tour?._id || index;
              return (
                <TarjetaTour
                  key={`favorito-${tourId}-${index}`}
                  tour={tour}
                  tipo="favorito"
                  estaInscrito={misInscripcionesIds.includes(tourId)}
                  procesando={procesandoTourId === tourId}
                  onSelectTour={setTourSeleccionado}
                  onToggleInscripcion={handleToggleInscripcion}
                  onQuitarFavorito={handleQuitarFavorito}
                  getImagenUrl={getImagenUrl}
                  obtenerFechasTour={obtenerFechasTour}
                  obtenerCuposTour={obtenerCuposTour}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
