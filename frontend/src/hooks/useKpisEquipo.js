import { useState } from "react";
import api from "../services/api";

export function useKpisEquipo() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchKpis = async (equipoId, file) => {
    if (!file) {
      setError("Debes seleccionar un archivo");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(
        `/kpis/by-equipo/${equipoId}`,
        formData
      );

      setData(res.data);
    } catch (e) {
      setError("Error cargando KPIs");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchKpis };
}
