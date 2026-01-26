export async function getKpisByEquipo(equipoId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/kpis/by-equipo/${equipoId}`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );

  if (!res.ok) {
    console.error("Error servidor:", res.status);
    throw new Error("Error al obtener KPIs del equipo");
  }

  return await res.json();
}
