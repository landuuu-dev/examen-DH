import React, { useState } from "react";
import TourForm from "../TourForm";
import CategoriasForm from "./CategoriasForm";
import ListaCategorias from "./ListaCategorias";
import ListaTours from "../ListaTours";

function HeaderAdmin() {
  const [activeComponent, setActiveComponent] = useState("Crear tour");

  const componentsMap = {
    "Crear tour": <TourForm />,
    "Lista Tours": <ListaTours />,
    "Crear Categoría": <CategoriasForm />,
    "Lista Categorías": <ListaCategorias />,
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Navegación por Pestañas */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 flex flex-wrap gap-1 shadow-inner">
        {Object.keys(componentsMap).map((label) => {
          const isActive = activeComponent === label;
          return (
            <button
              key={label}
              onClick={() => setActiveComponent(label)}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-center ${
                isActive
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Área del Contenido Activo */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 md:p-6 transition-all">
        {componentsMap[activeComponent]}
      </div>
    </div>
  );
}

export default HeaderAdmin;
