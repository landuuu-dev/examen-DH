import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/categorias")
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar categorías:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">Categorías</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            onClick={() => navigate(`/categorias/${cat.id}/tours`)}
            className="cursor-pointer bg-white shadow-md rounded-2xl p-5 border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition duration-200"
          >
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">{cat.nombre}</h2>
            <p className="text-gray-600">{cat.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categorias;
