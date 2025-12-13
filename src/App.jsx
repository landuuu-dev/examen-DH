import { Routes, Route } from "react-router-dom";
import Header from "./componentesEstaticos/Header";
import Footer from "./componentesEstaticos/Footer";

import Home from "./pages/Home";
import IniciarSesion from "./pages/IniciarSesion";
import Registrarse from "./pages/Registrarse";

import PanelAdmin from "./pages/panelAdministracion/PanelAdmin";
import ListaCategorias from "./pages/panelAdministracion/categoria/ListaCategorias";
import CategoriaForm from "./pages/panelAdministracion/categoria/CategoriasForm";
import ToursPorCategoria from "./Componentes/TourPorCategoria"; // asegúrate que la ruta esté bien
import ListaTours from "./pages/panelAdministracion/ListaTours";
import TourForm from "./pages/panelAdministracion/TourForm";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/registrarse" element={<Registrarse />} />

        {/* Panel de Administración categoria*/}
        <Route path="/panel-admin" element={<PanelAdmin />} />
        <Route path="/panel-admin/categorias" element={<ListaCategorias />} />
        <Route path="/panel-admin/categorias/crear" element={<CategoriaForm />} />
        <Route path="/panel-admin/categorias/editar/:id" element={<CategoriaForm />} />

        {/*Panel de administracion tours*/}
        <Route path="/panel-admin/tours" element={<ListaTours />} />
        <Route path="/panel-admin/tours/crear" element={<TourForm />} />
        <Route path="/panel-admin/tours/editar/:id" element={<TourForm />} />

        {/* Tours por categoría */}
        <Route path="/categorias/:id/tours" element={<ToursPorCategoria />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
