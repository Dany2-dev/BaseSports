import { useState } from "react";

export default function FiltersSidebar({ filters, setFilters }) {
  const togglePeriodo = (p) => {
    setFilters((prev) => ({
      ...prev,
      periodos: prev.periodos.includes(p)
        ? prev.periodos.filter((x) => x !== p)
        : [...prev.periodos, p],
    }));
  };

  return (
    <aside className="w-72 bg-[#0f172a] text-white p-6 space-y-6">
      <h2 className="text-xl font-bold tracking-wide">
        ⚡ DATASTRIKE
      </h2>
      <p className="text-xs text-gray-400">Control Center</p>

      {/* CHECKS */}
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.heatmap}
            onChange={(e) =>
              setFilters({ ...filters, heatmap: e.target.checked })
            }
          />
          Mostrar heatmap en cancha
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.pasesProgresivos}
            onChange={(e) =>
              setFilters({ ...filters, pasesProgresivos: e.target.checked })
            }
          />
          Mostrar pases progresivos
        </label>
      </div>

      {/* PERIODO */}
      <div>
        <p className="font-semibold mb-2">Periodo</p>
        <div className="flex gap-2">
          {["1T", "2T"].map((p) => (
            <button
              key={p}
              onClick={() => togglePeriodo(p)}
              className={`px-3 py-1 rounded text-sm ${
                filters.periodos.includes(p)
                  ? "bg-red-500"
                  : "bg-gray-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* JUGADOR */}
      <div>
        <p className="font-semibold mb-2">Jugador</p>
        <select
          value={filters.jugador}
          onChange={(e) =>
            setFilters({ ...filters, jugador: e.target.value })
          }
          className="w-full p-2 rounded bg-gray-800"
        >
          <option value="">Todos</option>
          {/* luego se llenará dinámico */}
          <option value="10">Jugador 10</option>
          <option value="7">Jugador 7</option>
        </select>
      </div>

      {/* RESULTADO */}
      <div>
        <p className="font-semibold mb-2">Resultado</p>
        <select
          value={filters.resultado}
          onChange={(e) =>
            setFilters({ ...filters, resultado: e.target.value })
          }
          className="w-full p-2 rounded bg-gray-800"
        >
          <option value="">Todos</option>
          <option value="ganado">Ganado</option>
          <option value="perdido">Perdido</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>

      {/* TIPO DE EVENTO */}
      <div>
        <p className="font-semibold mb-2">Tipo de acción</p>
        <select
          value={filters.tipoEvento}
          onChange={(e) =>
            setFilters({ ...filters, tipoEvento: e.target.value })
          }
          className="w-full p-2 rounded bg-gray-800"
        >
          <option value="">Todos</option>
          <option value="pase">Pase</option>
          <option value="tiro">Tiro</option>
          <option value="gol">Gol</option>
          <option value="duelo">Duelo</option>
        </select>
      </div>
    </aside>
  );
}
