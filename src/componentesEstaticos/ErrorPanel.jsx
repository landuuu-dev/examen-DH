import React from "react";

function ErrorPanel({ tipo = "permisos" }) {
  // Configuración dinámica según la razón de bloqueo
  const esMovil = tipo === "movil";

  const titulo = esMovil
    ? "⚠️ Dispositivo No Compatible"
    : "⛔ Acceso Denegado";

  const mensajePrincipal = esMovil
    ? "El panel de administración solo está disponible para computadoras de escritorio o laptops."
    : "No tienes los permisos suficientes para acceder a esta sección.";

  const mensajeSecundario = esMovil
    ? "Por favor, accede desde un dispositivo con mayor resolución de pantalla."
    : "Esta vista es exclusiva para Administradores y Super Administradores.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10 max-w-md text-center space-y-4">
        {/* Icono dinámico */}
        <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-3xl">
          {esMovil ? "📱" : "🔒"}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {titulo}
        </h1>

        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          {mensajePrincipal}
        </p>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <p className="text-slate-500 text-xs font-medium">
            {mensajeSecundario}
          </p>
        </div>

        <div className="pt-2">
          <a
            href="/"
            className="inline-block w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition duration-150"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export default ErrorPanel;
