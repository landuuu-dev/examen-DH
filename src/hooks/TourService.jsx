// src/services/TourService.jsx (o TourService.js)

const BACKEND_URL = "https://backend-examen-dh.onrender.com";

// 1. Obtener todos los tours
export const obtenerTours = async () => {
  const response = await fetch(`${BACKEND_URL}/tours`);
  if (!response.ok) {
    throw new Error("Error al obtener la lista de tours.");
  }
  return await response.json();
};

// 2. Obtener tours por categoría
export const obtenerToursPorCategoria = async (categoriaId) => {
  const response = await fetch(`${BACKEND_URL}/tours/categoria/${categoriaId}`);
  if (!response.ok) {
    throw new Error("Error al obtener los tours de la categoría.");
  }
  return await response.json();
};

// 3. Inscribirse a un tour
export const inscribirseATour = async (tourId, token) => {
  const response = await fetch(`${BACKEND_URL}/tours/${tourId}/inscribir`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Error al inscribirse en el tour.");
  }

  return await response.text();
};

// 4. Cancelar/Desinscribirse de un tour
export const desinscribirseDeTour = async (tourId, token) => {
  const response = await fetch(
    `${BACKEND_URL}/tours/${tourId}/desinscribirse`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Error al cancelar la inscripción.");
  }

  return await response.text();
};
