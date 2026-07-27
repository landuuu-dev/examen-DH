// src/services/TourService.jsx

const BACKEND_URL = "https://backend-examen-dh.onrender.com";

// Helper para procesar respuestas de error o éxito
const procesarRespuesta = async (response) => {
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    const errorMsg =
      typeof data === "object" && data.message ? data.message : text;
    throw new Error(errorMsg || "Ocurrió un error en la solicitud.");
  }

  return data;
};

// 1. Obtener todos los tours
export const obtenerTours = async () => {
  const response = await fetch(`${BACKEND_URL}/tours`);
  return await procesarRespuesta(response);
};

// 2. Obtener tours por categoría
export const obtenerToursPorCategoria = async (categoriaId) => {
  const response = await fetch(`${BACKEND_URL}/tours/categoria/${categoriaId}`);
  return await procesarRespuesta(response);
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

  return await procesarRespuesta(response);
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

  return await procesarRespuesta(response);
};
