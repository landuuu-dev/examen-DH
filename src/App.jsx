import React, { useState } from "react"; // 👈 Importación corregida
import { Routes, Route } from "react-router-dom";
import Header from "./componentesEstaticos/Header";
import Footer from "./componentesEstaticos/Footer";

import Home from "./pages/paginasPublicas/Home";
import IniciarSesion from "./pages/paginasPublicas/IniciarSesion";
import Registrarse from "./pages/paginasPublicas/Registrarse";

import PanelAdmin from "./pages/panelAdministracion/PanelAdmin";
import ListaCategorias from "./pages/panelAdministracion/categoria/ListaCategorias";
import CategoriaForm from "./pages/panelAdministracion/categoria/CategoriasForm";
import ToursPorCategoria from "./Componentes/TourPorCategoria";
import ListaTours from "./pages/panelAdministracion/Tour/ListaTours";
import TourForm from "./pages/panelAdministracion/Tour/TourForm";
import PanelUsuario from "./pages/panelUsuario/PanelUsuario";
import ToursPublicos from "./pages/paginasPublicas/ToursPublicos";
import Categorias from "./Componentes/Categorias";

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );
  const [usuario, setUsuario] = useState(() => {
    const userStored = localStorage.getItem("usuario");
    return userStored ? JSON.parse(userStored) : null;
  });

  const handleLoginSuccess = ({ token, usuario }) => {
    setToken(token);
    setUsuario(usuario);
  };

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/iniciar-sesion"
          element={<IniciarSesion onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/tours"
          element={<ToursPublicos usuario={usuario} token={token} />}
        />
        <Route
          path="/panel-usuario"
          element={<PanelUsuario usuario={usuario} token={token} />}
        />
        <Route path="/registrarse" element={<Registrarse />} />

        {/* Panel de Administración */}
        <Route path="/panel-admin" element={<PanelAdmin />} />
        <Route path="/panel-admin/categorias" element={<ListaCategorias />} />
        <Route
          path="/panel-admin/categorias/crear"
          element={<CategoriaForm />}
        />
        <Route
          path="/panel-admin/categorias/editar/:id"
          element={<CategoriaForm />}
        />

        {/* Administracion de tours */}
        <Route path="/panel-admin/tours" element={<ListaTours />} />
        <Route path="/panel-admin/tours/crear" element={<TourForm />} />
        <Route path="/panel-admin/tours/editar/:id" element={<TourForm />} />
        {/* Tus otras rutas */}
        <Route path="/categorias" element={<Categorias />} />

        {/* 🔴 RUTA CLAVE: coincide con el navigate(`/categorias/${cat.id}/tours`) */}
        <Route path="/categorias/:id/tours" element={<ToursPorCategoria />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
