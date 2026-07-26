import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BarraBusqueda() {
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  const navigate = useNavigate();

  // Cargar categorías desde el backend
  useEffect(() => {
    fetch("https://backend-examen-dh.onrender.com/categorias")
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

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    // Enviamos el parámetro con la clave "nombre"
    if (busqueda.trim()) {
      params.append("nombre", busqueda.trim());
    }

    if (categoriaSeleccionada) {
      params.append("categoriaId", categoriaSeleccionada);
    }

    // Redirige a /tours?nombre=pinturas
    navigate(`/tours?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 text-center">
      {/* Encabezado con margen inferior separado de la barra */}
      <div className="space-y-3 mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Busca tu próximo destino, <br className="hidden sm:inline" />
          <span className="text-indigo-600">tu aventura empieza aquí</span>
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium">
          Crea con tus manos, conecta con tu historia
        </p>
      </div>

      {/* Contenedor de la Barra de Búsqueda */}
      <form
        onSubmit={handleSearch}
        className="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl sm:rounded-full border border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
          {/* Campo de búsqueda por texto */}
          <div className="relative w-full flex-1">
            <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="¿A dónde quieres ir o qué quieres hacer?"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 sm:bg-transparent border border-slate-200 sm:border-0 rounded-xl sm:rounded-none text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:focus:ring-0 text-sm font-medium"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Separador vertical para escritorio */}
          <div className="hidden sm:block w-px h-8 bg-slate-200" />

          {/* Select de Categorías */}
          {/* Select de Categorías */}
          <div className="w-full sm:w-56">
            <select
              id="categoria"
              name="categoria"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-50 sm:bg-transparent border border-slate-200 sm:border-0 rounded-xl sm:rounded-none text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:focus:ring-0 text-sm font-semibold capitalize cursor-pointer"
            >
              <option value="">
                {loadingCategorias ? "Cargando..." : "Todas las categorías"}
              </option>
              {categorias.map((cat) => (
                /* Cambiamos cat.id por cat.nombre o cat.id según requiera tu backend */
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de Búsqueda */}
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl sm:rounded-full transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Buscar</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
