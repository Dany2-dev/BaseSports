import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import Pitch from "../components/Pitch";

// Iconos rápidos (simulados o puedes instalar react-icons)
const IconChevron = ({ open }) => (
  <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
);

export default function Dashboard() {
  const { equipoId } = useParams();

  // ===== ESTADOS =====
  const [file, setFile] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [periodoActivo, setPeriodoActivo] = useState("TOTAL");
  const [filtroJugador, setFiltroJugador] = useState("");
  const [mostrarTabla, setMostrarTabla] = useState(true);

  // ===== PETICIÓN KPIS =====
  const calcularKpis = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await api.post(`/kpis/by-equipo/${equipoId}`, formData);
      setKpis(res.data);
    } catch (err) {
      console.error(err);
      alert("Error al calcular KPIs");
    } finally {
      setLoading(false);
    }
  };

  // ===== LÓGICA DE FILTRADO =====
  const resumenActivo = useMemo(() => {
    return periodoActivo === "TOTAL" ? kpis?.general : kpis?.por_periodo?.[periodoActivo];
  }, [kpis, periodoActivo]);

  const jugadoresFiltrados = useMemo(() => {
    if (!kpis?.por_jugador) return [];
    return Object.entries(kpis.por_jugador).filter(([id]) => {
      return filtroJugador === "" || id === filtroJugador;
    });
  }, [kpis, filtroJugador]);

  const maxXG = useMemo(() => {
    if (!kpis?.por_jugador) return 1;
    const values = Object.values(kpis.por_jugador).map((j) => j.xg || 0);
    return Math.max(...values, 1);
  }, [kpis]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8 font-sans text-slate-900"
    >
      {/* ===== HEADER PRINCIPAL ===== */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Panel de Control</h1>
          <p className="text-slate-500 font-medium">Gestión de métricas avanzadas y rendimiento</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
            />
          </div>
          <button
            onClick={calcularKpis}
            disabled={!file || loading}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
          >
            {loading ? "Procesando..." : "Procesar Data"}
          </button>
        </div>
      </header>

      {/* ===== LOADING STATE ===== */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-bold animate-pulse">Analizando estadísticas en tiempo real...</p>
        </div>
      )}

      {kpis && !loading && (
        <>
          {/* ===== SELECTOR DE PERIODO ===== */}
          <nav className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit border border-slate-200">
            {["TOTAL", "1T", "2T"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodoActivo(p)}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                  periodoActivo === p 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p === "TOTAL" ? "Tiempo Total" : `Periodo ${p}`}
              </button>
            ))}
          </nav>

          {/* ===== MÉTRICAS CLAVE ===== */}
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card label="Eventos" value={resumenActivo?.eventos ?? 0} />
            <Card label="Goles" value={resumenActivo?.goles ?? 0} />
            <Card label="xG Generado" value={resumenActivo?.xg?.toFixed(2) ?? 0} />
            <Card 
              label="% Pases" 
              value={`${resumenActivo?.porcentaje_pases?.toFixed(1) ?? 0}%`} 
              highlight 
            />
            <Card 
              label="% Pérdidas" 
              value={`${resumenActivo?.porcentaje_perdidas?.toFixed(1) ?? 0}%`} 
              isNegative 
            />
          </section>

          {/* ===== VISUALIZACIÓN DEL CAMPO ===== */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-6 bg-green-500 rounded-full" />
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Mapa de Acciones en Campo</h2>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 min-h-[400px]">
              <Pitch 
                eventos={kpis?.eventos || []}  
                periodo={periodoActivo} 
                jugadorId={filtroJugador} 
              />
            </div>
          </section>

          {/* ===== TABLA DE RENDIMIENTO ===== */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Rendimiento Individual</h2>
                <p className="text-slate-500 font-medium">Análisis detallado por jugador y tipo de acción</p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <select
                  value={filtroJugador}
                  onChange={(e) => setFiltroJugador(e.target.value)}
                  className="flex-1 md:w-72 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todos los jugadores</option>
                  {Object.entries(kpis.por_jugador).map(([id, j]) => (
                    <option key={id} value={id}>{j.jugador}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => setMostrarTabla(!mostrarTabla)}
                  className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
                >
                  <IconChevron open={mostrarTabla} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {mostrarTabla && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-x-auto"
                >
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 text-[11px] uppercase tracking-[0.15em] text-slate-400 font-black border-b border-slate-100">
                        <th className="px-8 py-5 text-left">Jugador</th>
                        <th className="px-8 py-5 text-center">Total Eventos</th>
                        <th className="px-8 py-5 text-left">Desglose de Acciones</th>
                        <th className="px-8 py-5 text-right">Métrica xG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {jugadoresFiltrados.map(([id, j]) => (
                        <tr key={id} className="group hover:bg-blue-50/30 transition-all">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img
                                  src={j.imagen_jugador || "/default-player.png"}
                                  className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm object-cover group-hover:scale-105 transition-transform"
                                  alt={j.jugador}
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                                  {j.dorsal || '•'}
                                </div>
                              </div>
                              <span className="font-black text-slate-700 text-lg">{j.jugador}</span>
                            </div>
                          </td>

                          <td className="px-8 py-6 text-center">
                            <span className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                              {j.eventos_total}
                            </span>
                          </td>

                          <td className="px-8 py-6">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(j.eventos_por_tipo || {}).map(([tipo, cantidad]) => (
                                <div
                                  key={tipo}
                                  className="flex flex-col items-center justify-center min-w-[75px] py-2 px-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-colors"
                                >
                                  <span className="text-base font-black text-blue-600 leading-none">{cantidad}</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-wider">
                                    {tipo}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="px-8 py-6 text-right">
                            <div className="inline-flex flex-col items-end gap-2 min-w-[160px]">
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-slate-800 leading-none">{j.xg?.toFixed(2)}</span>
                                <span className="text-xs text-slate-400 font-black uppercase">xG</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(j.xg / maxXG) * 100}%` }}
                                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </>
      )}
    </motion.div>
  );
}

// Componente Card Optimizado
function Card({ label, value, highlight = false, isNegative = false }) {
  return (
    <div className={`p-6 rounded-3xl shadow-sm border transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 
      ${highlight ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-800"}`}
    >
      <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-3 
        ${highlight ? "text-blue-100" : "text-slate-400"}`}
      >
        {label}
      </p>
      <p className={`text-4xl font-black leading-none ${isNegative && !highlight ? "text-red-500" : ""}`}>
        {value}
      </p>
    </div>
  );
}