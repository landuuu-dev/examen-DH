import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function IniciarSesion({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        "https://backend-examen-dh.onrender.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correo: email.trim(),
            password: password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      const token = data.token;
      const rol = data.rol;

      // Intentamos obtener el ID si el backend lo devuelve en la respuesta directa
      const idReal = data.id || data.userId || data.idUsuario || null;

      const usuarioObj = {
        id: idReal,
        correo: email.trim().toLowerCase(),
        rol: rol,
      };

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuarioObj));

      // Notificar cambios de estado
      window.dispatchEvent(new Event("loginStateChange"));

      if (onLoginSuccess) {
        onLoginSuccess({ token, usuario: usuarioObj });
      }

      // ✅ COMPROBACIÓN FLEXIBLE PARA ROLES DE ADMINISTRADOR
      const rolUpper = String(rol || "").toUpperCase();
      const esAdministrador =
        rolUpper.includes("ADMIN") ||
        rolUpper === "SUPER_ADMIN" ||
        rolUpper === "ADMIN";

      if (esAdministrador) {
        navigate("/panel-admin");
      } else {
        navigate("/panel-usuario");
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Iniciar Sesión
          </h2>
          <p className="text-slate-500 text-sm">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl shadow-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
