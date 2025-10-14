import React from 'react'
import '../estilosCSS/home.css';
import BarraBusqueda from '../Componentes/BarraBusqueda';
import Recomendaciones from '../Componentes/Recomendaciones';
import Categorias from '../Componentes/Categorias';

function Home() {
  return (
        <section className="pag-inicio">
        <BarraBusqueda></BarraBusqueda>
        <Categorias></Categorias>
        <Recomendaciones></Recomendaciones>

        </section>
        
  )
}

export default Home