import { useState, useEffect } from "react";

export function useFavoritos(usuario, token) {
  const [favoritosIds, setFavoritosIds] = useState([]);
  const [cargandoFavs, setCargandoFavs] = useState(false);
  const BACKEND_URL = "https://backend-examen-dh.onrender.com";

  // Capturamos cualquier variante donde Mongo / Spring pueda poner el ID
  const userId = usuario?.id || usuario?._id || usuario?.idUsuario;

  useEffect(() => {
    // Si no hay token o no hay ID válido (o es un email), no hacemos fetch
    if (
      !token ||
      !userId ||
      (typeof userId === "string" && userId.includes("@"))
    ) {
      setFavoritosIds([]);
      return;
    }

    const cargarFavoritos = async () => {
      setCargandoFavs(true);
      try {
        const res = await fetch(`${BACKEND_URL}/usuarios/${userId}/favoritos`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          setFavoritosIds(data.map((tour) => tour.id || tour._id));
        }
      } catch (err) {
        console.error("Error al obtener favoritos:", err);
      } finally {
        setCargandoFavs(false);
      }
    };

    cargarFavoritos();
  }, [userId, token]);

  const toggleFavorito = async (tourId) => {
    // Re-evaluamos el objeto usuario guardado en localStorage en el instante del clic por si las props están desactualizadas
    const usuarioStorage = JSON.parse(localStorage.getItem("usuario") || "{}");
    const tokenStorage = localStorage.getItem("token") || token;

    const currentUserId =
      userId ||
      usuarioStorage?.id ||
      usuarioStorage?._id ||
      usuarioStorage?.idUsuario;

    console.log("🔍 DIAGNÓSTICO EN CLIC FAVORITO:");
    console.log("-> Objeto 'usuario' recibido en hook:", usuario);
    console.log("-> Objeto 'usuario' en localStorage:", usuarioStorage);
    console.log("-> 'currentUserId' final evaluado:", currentUserId);

    if (
      !tokenStorage ||
      !currentUserId ||
      (typeof currentUserId === "string" && currentUserId.includes("@"))
    ) {
      alert(
        `tu usuario no tiene un id valido asignado por el servidor para guardar en favoritos (Valor actual: ${currentUserId})`,
      );
      return;
    }

    const esFavorito = favoritosIds.includes(tourId);
    const metodo = esFavorito ? "DELETE" : "POST";
    const endpoint = `${BACKEND_URL}/usuarios/${currentUserId}/favoritos/${tourId}`;

    setFavoritosIds((prev) =>
      esFavorito ? prev.filter((id) => id !== tourId) : [...prev, tourId],
    );

    try {
      const res = await fetch(endpoint, {
        method: metodo,
        headers: {
          Authorization: `Bearer ${tokenStorage}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setFavoritosIds((prev) =>
          esFavorito ? [...prev, tourId] : prev.filter((id) => id !== tourId),
        );
        alert("No se pudo actualizar el favorito en el servidor.");
      }
    } catch (error) {
      console.error("Error en la petición de favorito:", error);
      setFavoritosIds((prev) =>
        esFavorito ? [...prev, tourId] : prev.filter((id) => id !== tourId),
      );
    }
  };

  return { favoritosIds, toggleFavorito, cargandoFavs };
}
