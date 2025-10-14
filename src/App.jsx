import { Routes, Route } from "react-router-dom";
import Header from "./componentesEstaticos/Header";
import Home from "./pages/Home";
import IniciarSesion from "./pages/IniciarSesion";
import Registrarse from "./pages/Registrarse";
import Footer from "./componentesEstaticos/Footer";

function App() {
  return (
    <>
      <Header /> 
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home solo en / */}
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/registrarse" element={<Registrarse />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
