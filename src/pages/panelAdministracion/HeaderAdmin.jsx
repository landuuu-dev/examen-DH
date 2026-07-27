import React, { useState } from "react";
import TourForm from "./Tour/TourForm";
import CategoriasForm from "./categoria/CategoriasForm";
import ListaCategorias from "./categoria/ListaCategorias";
import ListaTours from "./Tour/ListaTours";
import ListaUsuarios from "./usuarios/ListaUsuarios";

function HeaderAdmin() {
  const [activeComponent, setActiveComponent] = useState("Crear tour");
  const [openDropdown, setOpenDropdown] = useState(null);

  // Mapeo de componentes según la opción seleccionada
  const componentsMap = {
    "Crear tour": <TourForm />,
    "Lista Tours": <ListaTours />,
    "Crear Categoría": <CategoriasForm />,
    "Lista Categorías": <ListaCategorias />,
    "Lista Usuarios": <ListaUsuarios />,
  };

  // Ítems de navegación principal con submenús
  const menuItems = [
    {
      title: "Tours",
      options: ["Crear tour", "Lista Tours"],
    },
    {
      title: "Categorías",
      options: ["Crear Categoría", "Lista Categorías"],
    },
    {
      title: "Usuarios",
      options: ["Lista Usuarios"],
    },
  ];

  const handleSelectOption = (option) => {
    setActiveComponent(option);
    setOpenDropdown(null); // Cierra el menú al seleccionar
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Navegación Principal */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 flex gap-2 shadow-inner relative">
        {menuItems.map((menu) => {
          const isCategoryActive = menu.options.includes(activeComponent);
          const isOpen = openDropdown === menu.title;

          return (
            <div key={menu.title} className="relative flex-1">
              {/* Botón Principal del Menú */}
              <button
                onClick={() => setOpenDropdown(isOpen ? null : menu.title)}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-2 ${
                  isCategoryActive
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>{menu.title}</span>
                <span className="text-xs opacity-60">
                  {isCategoryActive ? `(${activeComponent})` : "▼"}
                </span>
              </button>

              {/* Submenú Desplegable */}
              {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 z-10 flex flex-col gap-1">
                  {menu.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSelectOption(option)}
                      className={`w-full py-2 px-3 text-left text-sm rounded-lg font-medium transition-colors ${
                        activeComponent === option
                          ? "bg-indigo-50 text-indigo-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
