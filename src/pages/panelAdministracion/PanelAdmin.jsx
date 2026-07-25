import React from "react";
import HeaderAdmin from "./categoria/HeaderAdmin";

function PanelAdmin() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 mt-16">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado del Panel */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Gestiona el catálogo de tours, categorías y usuarios del sistema.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Modo Administrador
            </span>
          </div>
        </header>

        {/* Contenedor de Navegación / Contenido Admin */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <HeaderAdmin />
        </section>
      </div>
    </div>
  );
}

export default PanelAdmin;
