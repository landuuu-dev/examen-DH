import React from "react";
import Logo from "../componentesEstaticos/Logo";

function Footer() {
  return (
    <footer className="w-full bg-[#2AB7CA] text-white py-4 px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between flex-wrap">

      {/* Bloque izquierdo: logo + texto */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
        <Logo /> {/* Solo imagen */}
        <span className="text-xs sm:text-sm md:text-base font-bold">
          &copy; {new Date().getFullYear()} Manos del Sol. Todos los derechos reservados.
        </span>
      </div>

      {/* Bloque derecho: enlaces o redes sociales */}
      <div className="mt-3 md:mt-0 flex space-x-4 flex-wrap">
        {/* <a href="#" className="hover:underline text-sm">Facebook</a>
        <a href="#" className="hover:underline text-sm">Instagram</a> */}
      </div>
    </footer>
  );
}

export default Footer;
