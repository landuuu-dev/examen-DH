import React, { useState } from 'react';
import Logo from "./Logo";
import { Link } from "react-router-dom";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full h-24 z-50"> {/* altura fija */}
        <div className="w-full h-full bg-gradient-to-b from-white/90 to-white/0 backdrop-blur-sm flex justify-between items-center px-6 py-4">
          
          {/* Logo clickeable */}
          <Link to="/">
            <Logo className="text-white" />
          </Link>

          {/* Botón hamburguesa para móviles */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-white focus:outline-none"
            >
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Menú de enlaces */}
          <div className={`flex flex-col md:flex-row md:space-x-6 absolute md:static top-full left-0 w-full md:w-auto 
                   bg-white/90 backdrop-blur-sm md:bg-transparent md:backdrop-blur-0 transition-all duration-300 ${isOpen ? 'block' : 'hidden'} md:flex`}>
            <Link
              to="/iniciar-sesion"
              className="text-white font-semibold border border-white px-6 py-2 md:px-4 md:py-1 rounded-lg hover:bg-white/20 transition tracking-wide"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/registrarse"
              className="text-white font-semibold border border-white px-6 py-2 md:px-4 md:py-1 rounded-lg hover:bg-white/20 transition tracking-wide"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer para empujar el contenido abajo del header */}
      <div className="h-24" /> {/* la misma altura que el nav */}
    </>
  );
}

export default Header;
