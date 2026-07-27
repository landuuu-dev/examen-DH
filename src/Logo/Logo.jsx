import React from "react";
import logoImg from "./logo.png";

function Logo({ className = "h-9 w-auto", textClassName = "text-slate-800" }) {
  return (
    <div className="flex items-center gap-3">
      {/* Añadimos un pequeño fondo claro/glow suave por si el logo PNG tiene detalles oscuros */}
      <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-xl border border-white/10 flex items-center justify-center">
        <img
          src={logoImg}
          alt="Tours sol andino logo"
          className={`object-contain ${className}`}
        />
      </div>
      <span className={`font-bold text-xl tracking-tight ${textClassName}`}>
        Tours sol andino
      </span>
    </div>
  );
}

export default Logo;
