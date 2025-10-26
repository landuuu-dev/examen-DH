import { Routes, Route } from "react-router-dom";
import Header from "./componentesEstaticos/Header";
import Footer from "./componentesEstaticos/Footer";

import Home from "./pages/Home";
import IniciarSesion from "./pages/IniciarSesion";
import Registrarse from "./pages/Registrarse";

import PanelAdmin from "./pages/panelAdministracion/PanelAdmin";
import ListaCategorias from "./pages/panelAdministracion/ListaCategorias";
import CategoriaForm from "./pages/panelAdministracion/CategoriasForm";
import ToursPorCategoria from "./Componentes/TourPorCategoria"; // asegúrate que la ruta esté bien

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/registrarse" element={<Registrarse />} />

        {/* Panel de Administración */}
        <Route path="/panel-admin" element={<PanelAdmin />} />
        <Route path="/panel-admin/categorias" element={<ListaCategorias />} />
        <Route path="/panel-admin/categorias/crear" element={<CategoriaForm />} />
        <Route path="/panel-admin/categorias/editar/:id" element={<CategoriaForm />} />

        {/* Tours por categoría */}
        <Route path="/categorias/:id/tours" element={<ToursPorCategoria />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
