import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  const comprobarSesion = () => {
    const token = localStorage.getItem("token");
    setIsAuth(!!token);
  };

  useEffect(() => {
    comprobarSesion();

    const handleStorageChange = () => comprobarSesion();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("loginStateChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("loginStateChange", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setIsAuth(false);
    setIsOpen(false);

    window.dispatchEvent(new Event("loginStateChange"));
    navigate("/iniciar-sesion");
  };

  return (
    <>
      {/* Navbar con fondo blanco sólido y elevación mediante sombra sutil */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md border-b border-slate-100">
        <div className="w-full h-20 flex justify-between items-center px-6 md:px-12 max-w-7xl mx-auto">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 p-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition"
          >
            <Logo className="text-slate-900 h-9 w-auto" />
          </Link>

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={
                isOpen
                  ? "Cerrar menú de navegación"
                  : "Abrir menú de navegación"
              }
              className="text-slate-900 bg-slate-100 hover:bg-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition cursor-pointer"
            >
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
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
                  strokeWidth={2.5}
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

          {/* Opciones del Menú */}
          <div
            className={`
            absolute md:static top-20 left-0 w-full md:w-auto
            bg-white md:bg-transparent
            border-b border-slate-200 md:border-none p-6 md:p-0
            flex flex-col md:flex-row items-stretch md:items-center gap-3
            transition-all duration-200 ease-in-out shadow-xl md:shadow-none
            ${isOpen ? "flex opacity-100" : "hidden md:flex"}
          `}
          >
            {isAuth ? (
              // VISTA CON SESIÓN
              <>
                <Link
                  to="/panel-usuario"
                  onClick={() => setIsOpen(false)}
                  className="text-center text-slate-800 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 font-semibold text-base px-5 py-2.5 rounded-xl border border-slate-200/80 hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-150 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">👤</span>
                  <span>Mi cuenta</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-center text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 font-semibold text-base px-5 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition duration-150 cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              // VISTA SIN SESIÓN
              <>
                <Link
                  to="/iniciar-sesion"
                  onClick={() => setIsOpen(false)}
                  className="text-center text-slate-900 hover:text-indigo-700 bg-slate-100 hover:bg-slate-200 font-semibold text-base px-5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-150"
                >
                  Iniciar Sesión
                </Link>

                <Link
                  to="/registrarse"
                  onClick={() => setIsOpen(false)}
                  className="text-center text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 font-bold text-base px-6 py-2.5 rounded-xl shadow-sm hover:shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition duration-150"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="h-20" />
    </>
  );
}

export default Header;
