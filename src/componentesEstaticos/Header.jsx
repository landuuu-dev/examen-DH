import React, { useState } from "react";
import Logo from "./Logo";
import { Link } from "react-router-dom";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
        <div className="w-full h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex justify-between items-center px-6 md:px-12">
          {/* Logo clickeable */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Logo className="text-white h-8 w-auto" />
          </Link>

          {/* Botón hamburguesa para móviles */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Abrir menú"
              className="text-slate-300 hover:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700 transition"
            >
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Menú de enlaces */}
          <div
            className={`
            absolute md:static top-20 left-0 w-full md:w-auto
            bg-slate-900/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none
            border-b border-slate-800 md:border-none p-6 md:p-0
            flex flex-col md:flex-row items-center gap-4 md:gap-3
            transition-all duration-200 ease-in-out
            ${isOpen ? "flex opacity-100" : "hidden md:flex"}
          `}
          >
            <Link
              to="/iniciar-sesion"
              onClick={() => setIsOpen(false)}
              className="w-full md:w-auto text-center text-slate-300 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-slate-800/60 transition duration-200"
            >
              Iniciar Sesión
            </Link>

            <Link
              to="/registrarse"
              onClick={() => setIsOpen(false)}
              className="w-full md:w-auto text-center text-white bg-indigo-600 hover:bg-indigo-500 font-semibold px-5 py-2 rounded-lg shadow-sm shadow-indigo-500/20 active:scale-95 transition duration-200"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer para empujar el contenido abajo del header */}
      <div className="h-20" />
    </>
  );
}

export default Header;
