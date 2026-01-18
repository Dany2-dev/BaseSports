import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import KpiCard from "../components/KpiCard";

export default function DashboardJugador() {
  const { jugadorId } = useParams();

  const [jugador, setJugador] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔥 Llamada real al backend
        const res = await api.get("/kpis/by-equipo/5");

        const jugadorData = res.data.por_jugador[jugadorId];

        if (!jugadorData) {
          throw new Error("Jugador no encontrado");
        }

        setJugador({
          nombre: jugadorData.jugador,
          imagen: jugadorData.imagen_jugador,
        });

        setKpis(jugadorData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jugadorId]);

  if (loading) {
    return <p className="p-8">Cargando jugador...</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8"
    >
      {/* ===== HEADER JUGADOR ===== */}
      <div className="flex items-center gap-6">
        <img
          src={jugador.imagen}
          alt={jugador.nombre}
          className="w-24 h-24 rounded-full object-cover border"
          onError={(e) => {
            e.target.src = "/default-player.png";
          }}
        />
        <h1 className="text-3xl font-bold">{jugador.nombre}</h1>
      </div>

      {/* ===== KPIs ===== */}
      <section>
        <h2 className="text-xl font-semibold mb-3">KPIs del jugador</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard title="Eventos" value={kpis.eventos} />
          <KpiCard title="Tiros" value={kpis.tiros} />
          <KpiCard title="Goles" value={kpis.goles} />
          <KpiCard title="xG" value={kpis.xg} />
        </div>
      </section>

      {/* 🔜 Heatmap, mapas, gráficos */}
    </motion.div>
  );
}
