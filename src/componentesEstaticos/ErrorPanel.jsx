import React from 'react';

function ErrorPanel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-red-400 to-pink-500 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-red-600 mb-4">
          ⚠️ Acceso Denegado
        </h1>
        <p className="text-gray-700 text-base md:text-lg mb-6">
          El panel de administración solo puede ser usado desde computadoras.
        </p>
        <img
          src="https://img.icons8.com/ios-filled/100/ff0000/no-access.png"
          alt="Acceso denegado"
          className="mx-auto mb-6 w-24 h-24"
        />
        <p className="text-gray-500 text-sm">
          Por favor, accede desde un dispositivo con mayor resolución.
        </p>
      </div>
    </div>
  );
}

export default ErrorPanel;
