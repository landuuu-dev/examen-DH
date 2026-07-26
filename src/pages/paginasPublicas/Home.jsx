import React from "react";
import "../../estilosCSS/home.css";
import BarraBusqueda from "../../Componentes/BarraBusqueda";
import Recomendaciones from "../../Componentes/Recomendaciones";
import Categorias from "../../Componentes/Categorias";
import { useFavoritos } from "../../hooks/UseFavoritos";

function Home({ usuario: usuarioProp, token: tokenProp }) {
  // 1. Obtenemos lo guardado en localStorage como respaldo fresco
  const tokenStorage = localStorage.getItem("token");
  let usuarioStorage = null;

  try {
    const rawUser = localStorage.getItem("usuario");
    if (rawUser) usuarioStorage = JSON.parse(rawUser);
  } catch (e) {
    console.error("Error parseando usuario de localStorage en Home:", e);
  }

  // 2. Priorizamos los datos que SÍ tengan ID asignado
  const tokenFinal = tokenProp || tokenStorage;

  // Si la prop tiene ID la usamos; si no, usamos el del localStorage
  const usuarioFinal =
    usuarioProp && (usuarioProp.id || usuarioProp._id)
      ? usuarioProp
      : usuarioStorage;

  // 3. Inicializamos el hook con el usuario evaluado
  const { favoritosIds, toggleFavorito } = useFavoritos(
    usuarioFinal,
    tokenFinal,
  );

  return (
    <section className="pag-inicio">
      <BarraBusqueda />
      <Categorias />
      {/* 🎯 Pasamos usuario y token a Recomendaciones */}
      <Recomendaciones
        usuario={usuarioFinal}
        token={tokenFinal}
        favoritosIds={favoritosIds}
        toggleFavorito={toggleFavorito}
      />
    </section>
  );
}

export default Home;
