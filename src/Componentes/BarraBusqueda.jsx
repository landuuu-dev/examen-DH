import React from 'react'
import "../estilosCSS/home.css"

export default function BarraBusqueda() {
  return (
        <form action="/buscar" method="GET" className="hero-content">
            <h1>Busca tu próximo destino, tu aventura empieza aqui</h1>
            <p>Crea con tus manos conecta con tu historia</p>
            <div className="search-bar">
            <input 
                type="text" 
                placeholder="Buscar productos..." 
                className="search-input"
            />
            <select
                id="categoria"
                name="categoria"
                className="bg-gray-100 bg-opacity-50 text-gray-600 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                >
                <option value="">Selecciona una categoría</option>
                <option value="naturaleza">Naturaleza y Aventura</option>
                <option value="cultural">Cultura y Tradición</option>
                <option value="gastronomia">Gastronomía Local</option>
                <option value="artesania">Artesanía y Talleres</option>
            </select>
            <button className="search-btn">Buscar</button>
            </div>
        </form>
  )
}
