import React, { useMemo, useState } from "react";

const FIELD_WIDTH = 105;
const FIELD_HEIGHT = 68;

const getColor = (event) => {
  if (!event) return "#a855f7";
  if (event.includes("Asistencia") || event.includes("Gol")) return "#FACC15";
  if (event.includes("Pase completo") || event.includes("filtrado")) return "#22C55E";
  if (event.includes("incompleto") || event.includes("perdido") || event.includes("fallido")) return "#EF4444";
  if (event.includes("Duelo") || event.includes("Balon")) return "#3B82F6";
  if (event.includes("Tiro") || event.includes("Remate")) return "#FB923C";
  return "#94A3B8";
};

const MagicHeatmap = ({
  initialData,
  activeEventTypes = [],
  activePeriodo = "ALL"
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState("ALL"); // 👈 ESTADO PARA EL JUGADOR

  // 1. Obtener lista de jugadores únicos para el selector
  const playerList = useMemo(() => {
    if (!Array.isArray(initialData)) return [];
    const players = initialData
      .map(e => e.jugador)
      .filter(name => name && name !== "N/A");
    return [...new Set(players)].sort();
  }, [initialData]);

  // 2. Filtrado con la nueva lógica de jugador
  const visibleEvents = useMemo(() => {
    let events = Array.isArray(initialData)
      ? initialData.filter(e => e.x != null && e.y != null)
      : [];

    if (activeEventTypes.length > 0) {
      events = events.filter(e => activeEventTypes.includes(e.event));
    }

    if (activePeriodo !== "ALL") {
      events = events.filter(e => e.periodo === activePeriodo);
    }

    // 🔹 NUEVO: Filtro por jugador seleccionado
    if (selectedPlayer !== "ALL") {
      events = events.filter(e => e.jugador === selectedPlayer);
    }

    return events;
  }, [initialData, activeEventTypes, activePeriodo, selectedPlayer]);

  return (
    <div className="heatmap-container" style={{ width: "100%" }}>
      
      {/* 🔹 SELECTOR DE JUGADOR */}
      <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
        <label style={{ color: "#94A3B8", fontSize: "14px", fontFamily: "monospace" }}>FILTRAR POR JUGADOR:</label>
        <select 
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          style={{
            background: "#0f172a",
            color: "#fff",
            border: "1px solid #334155",
            padding: "5px 12px",
            borderRadius: "6px",
            outline: "none",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif"
          }}
        >
          <option value="ALL">Todos los jugadores</option>
          {playerList.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        
        {/* Contador de acciones visibles */}
        <span style={{ marginLeft: "auto", color: "#8400ff", fontSize: "12px", fontWeight: "bold" }}>
          {visibleEvents.length} ACCIONES
        </span>
      </div>

      <div
        className="heatmap-wrapper"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          aspectRatio: `${FIELD_WIDTH} / ${FIELD_HEIGHT}`,
          background: "#1a202c",
          borderRadius: "12px",
          overflow: "visible",
          border: "1px solid #2d3748"
        }}
      >
        {tooltip && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(12px, 12px)",
              background: "rgba(15,23,42,0.95)",
              color: "#fff",
              padding: "8px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
              zIndex: 50,
              border: "1px solid #334155"
            }}
          >
            <div><b>Jugador:</b> {tooltip.data.jugador ?? "N/A"}</div>
            <div><b>Evento:</b> {tooltip.data.event}</div>
            <div><b>Periodo:</b> {tooltip.data.periodo}</div>
            <div><b>Posición:</b> {tooltip.data.x}x, {tooltip.data.y}y</div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect x="0" y="0" width={FIELD_WIDTH} height={FIELD_HEIGHT} fill="#235d44" />

          <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" fill="none">
            <rect x="0" y="0" width={FIELD_WIDTH} height={FIELD_HEIGHT} />
            <line x1={FIELD_WIDTH / 2} y1="0" x2={FIELD_WIDTH / 2} y2={FIELD_HEIGHT} />
            <circle cx={FIELD_WIDTH / 2} cy={FIELD_HEIGHT / 2} r="9.15" />
            <rect x="0" y={(FIELD_HEIGHT - 40.3) / 2} width="16.5" height="40.3" />
            <rect x={FIELD_WIDTH - 16.5} y={(FIELD_HEIGHT - 40.3) / 2} width="16.5" height="40.3" />
            <rect x="0" y={(FIELD_HEIGHT - 18.32) / 2} width="5.5" height="18.32" />
            <rect x={FIELD_WIDTH - 5.5} y={(FIELD_HEIGHT - 18.32) / 2} width="5.5" height="18.32" />
          </g>

          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>

          {visibleEvents.map((e, i) => {
            const x = (e.x / 100) * FIELD_WIDTH;
            const y = FIELD_HEIGHT - (e.y / 100) * FIELD_HEIGHT;
            const color = getColor(e.event);
            const hasArrow = e.x2 != null && e.y2 != null && Number(e.x2) > 0.1;

            return (
              <g key={i}>
                {hasArrow && (
                  <line
                    x1={x}
                    y1={y}
                    x2={(e.x2 / 100) * FIELD_WIDTH}
                    y2={FIELD_HEIGHT - (e.y2 / 100) * FIELD_HEIGHT}
                    stroke={color}
                    strokeWidth="0.4"
                    opacity="0.5"
                    markerEnd="url(#arrow)"
                  />
                )}

                <circle
                  cx={x}
                  cy={y}
                  r={selectedPlayer !== "ALL" ? "1.2" : "0.8"} // Círculo un poco más grande si filtramos por jugador
                  fill={color}
                  stroke="#fff"
                  strokeWidth="0.15"
                  style={{ cursor: "pointer", transition: "all 0.2s" }}
                  onMouseMove={(ev) => {
                    const rect = ev.currentTarget.ownerSVGElement.getBoundingClientRect();
                    setTooltip({
                      x: ev.clientX - rect.left,
                      y: ev.clientY - rect.top,
                      data: e
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default MagicHeatmap;