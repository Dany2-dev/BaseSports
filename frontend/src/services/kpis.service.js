export async function getKpisByEquipo(equipoId) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/stats/by-equipo/${equipoId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ← importante si usas sesiones/cookies
    }
  );

  if (!res.ok) {
    console.error("Error servidor:", res.status);
    throw new Error("Error al obtener stats del equipo");
  }

  return await res.json();
}
