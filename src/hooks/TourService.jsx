// FUNCION PARA INSCRIBIRSE
const BACKEND_URL = "https://backend-examen-dh.onrender.com";

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
    throw new Error(errorData || "Error al inscribirse en el tour");
  }

  return await response.text();
};

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
    throw new Error(errorData || "Error al cancelar la inscripción");
  }

  return await response.text();
};

// Función para desinscribirse
export const desinscribirseDeTour = async (tourId, token) => {
  const response = await fetch(
    `http://tu-api.com/tours/${tourId}/desinscribirse`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Error al cancelar la inscripción");
  }

  return await response.text();
};
