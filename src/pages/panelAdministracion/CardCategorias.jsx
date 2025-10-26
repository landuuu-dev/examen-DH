import React from 'react';

function CardCategorias({ categoriaData, onDelete }) {
  if (!categoriaData) {
    return <h1>.......Cargando categorías.......</h1>;
  }

  const handleDelete = () => {
    // Llamamos al callback que viene desde ListaCategorias
    onDelete(categoriaData.id);
  };

  return (
    <div className='bg-white rounded-lg p-4 shadow-md'>
      {categoriaData.imagen1 && (
          <img
            src={`http://localhost:8080${categoriaData.imagen1}`}
            alt={`Imagen de ${categoriaData.nombre}`}
            className='w-full h-48 object-cover rounded-md'
          />
        )}

      <div className='mt-2'>
        <h2 className='text-xl font-semibold capitalize'>{categoriaData.nombre}</h2>
        <p className='text-gray-600 line-clamp-3'>{categoriaData.descripcion}</p>
      </div>

      <button
        onClick={handleDelete}
        className='mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
      >
        Eliminar
      </button>
    </div>
  );
}

export default CardCategorias;
