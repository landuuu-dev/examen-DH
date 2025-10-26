import React, { useEffect, useState } from 'react';
import CardCategorias from './CardCategorias';

function ListaCategorias() {
  const [categoriaData, setCategoriaData] = useState([]);
  const BASE_URL = "http://localhost:8080/categorias";

  const fetchCategorias = async () => {
    try {
      const resp = await fetch(BASE_URL);
      if (!resp.ok) {
        console.log("Hay un error en el fetch");
      }
      const data = await resp.json();
      setCategoriaData(data);
    } catch (error) {
      console.error("Error con el fetch de lista de categorías:", error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Función para eliminar categoría
  const handleDelete = async (id) => {
    try {
      const resp = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (resp.ok) {
        // Filtramos la categoría eliminada de nuestro estado
        setCategoriaData(categoriaData.filter(cat => cat.id !== id));
        alert('Categoría eliminada correctamente');
      } else {
        alert('No se pudo eliminar la categoría');
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {categoriaData.length === 0 ? (
        <p>No hay categorías disponibles.</p>
      ) : (
        categoriaData.map((categoria) => (
          <CardCategorias
            key={categoria.id}
            categoriaData={categoria}
            onDelete={handleDelete} // Pasamos el callback
          />
        ))
      )}
    </div>
  );
}

export default ListaCategorias;
