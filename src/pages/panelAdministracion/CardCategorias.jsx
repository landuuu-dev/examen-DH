import React from 'react';

function CardCategorias({ categoriaData, onDelete, onEdit }) {

  if (!categoriaData) {
    return <h1>.......Cargando categorías.......</h1>;
  }

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
        <p className='text-xs text-gray-600 line-clamp-3'>Id: {categoriaData.id}</p>
        <h2 className='text-xl font-semibold capitalize'>{categoriaData.nombre}</h2>
        <p className='text-gray-600 line-clamp-3'>{categoriaData.descripcion}</p>
      </div>

      <div className="flex mt-2">

      <button
        onClick={() => onEdit(categoriaData)}
        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2"
      >
        Editar
      </button>

      <button
        onClick={() => onDelete(categoriaData.id)}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Eliminar
      </button>
    </div>

    </div>
  );
}

export default CardCategorias;
