import React from "react";

export default function BotonFavorito({ tourId, esFavorito, onToggle }) {
  const handleClick = (e) => {
    e.stopPropagation(); // Evita que al hacer clic se abra el detalle del tour
    onToggle(tourId);
  };

  return (
    <button
      onClick={handleClick}
      title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
      className="p-2 bg-white/80 hover:bg-white backdrop-blur-xs rounded-full shadow-md hover:shadow-lg transition-all duration-200 group/btn cursor-pointer"
    >
      <svg
        className={`w-6 h-6 transition-transform active:scale-125 duration-200 ${
          esFavorito
            ? "fill-red-500 stroke-red-500 scale-105"
            : "fill-transparent stroke-slate-600 group-hover/btn:stroke-red-500"
        }`}
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
