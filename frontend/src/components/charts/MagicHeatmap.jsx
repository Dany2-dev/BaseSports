import React, { useMemo, useState, useRef } from "react";

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
  activePeriodo = "ALL"
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);

  // NUEVOS ESTADOS PARA ZOOM Y PANTALLA COMPLETA
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const playerList = useMemo(() => {
    if (!Array.isArray(initialData)) return [];
    const players = initialData
      .map(e => e.jugador)
      .filter(name => name && name !== "N/A");
    return [...new Set(players)].sort();
  }, [initialData]);

  const eventList = useMemo(() => {
    if (!Array.isArray(initialData)) return [];
    const events = initialData.map(e => e.event).filter(Boolean);
    return [...new Set(events)].sort();
  }, [initialData]);

  const visibleEvents = useMemo(() => {
    let events = Array.isArray(initialData)
      ? initialData.filter(e => e.x != null && e.y != null)
      : [];

    if (activePeriodo !== "ALL") {
      events = events.filter(e => e.periodo === activePeriodo);
    }

    if (selectedPlayers.length > 0) {
      events = events.filter(e => selectedPlayers.includes(e.jugador));
    }

    if (selectedEvents.length > 0) {
      events = events.filter(e => selectedEvents.includes(e.event));
    }

    return events;
  }, [initialData, activePeriodo, selectedPlayers, selectedEvents]);

  const handleToggle = (item, currentList, setter) => {
    if (currentList.includes(item)) {
      setter(currentList.filter(i => i !== item));
    } else {
      setter([...currentList, item]);
    }
  };

  return (
    <div
      ref={containerRef}
      className="heatmap-container"
      style={{
        width: "100%",
        color: "#fff",
        fontFamily: "sans-serif",
        background: "#0f172a",
        padding: "20px",
        overflow: "hidden"
      }}
    >

      {/* PANEL DE FILTROS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "15px",
        marginBottom: "15px",
        background: "#1e293b",
        padding: "15px",
        borderRadius: "12px",
        border: "1px solid #334155"
      }}>
        <div>
          <label style={{ color: "#94A3B8", fontSize: "11px", display: "block", marginBottom: "8px", fontWeight: "bold", textTransform: "uppercase" }}>Filtrar Jugadores:</label>
          <div style={{ maxHeight: "120px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
            {playerList.map(p => (
              <label key={p} style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input type="checkbox" checked={selectedPlayers.includes(p)} onChange={() => handleToggle(p, selectedPlayers, setSelectedPlayers)} />
                {p}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={{ color: "#94A3B8", fontSize: "11px", display: "block", marginBottom: "8px", fontWeight: "bold", textTransform: "uppercase" }}>Filtrar Eventos:</label>
          <div style={{ maxHeight: "120px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
            {eventList.map(ev => (
              <label key={ev} style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input type="checkbox" checked={selectedEvents.includes(ev)} onChange={() => handleToggle(ev, selectedEvents, setSelectedEvents)} />
                {ev}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* CONTROLES DE ZOOM Y LIMPIEZA */}
      <div style={{ marginBottom: "15px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => { setSelectedPlayers([]); setSelectedEvents([]); }}
            style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef4444", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
          >
            Limpiar Filtros
          </button>

          <button
            onClick={toggleFullScreen}
            style={{ background: "#334155", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
          >
            Pantalla Completa
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#1e293b", padding: "5px 15px", borderRadius: "20px" }}>
          <span style={{ fontSize: "11px", color: "#94A3B8" }}>Zoom:</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{ cursor: "pointer", accentColor: "#a855f7" }}
          />
          <span style={{ fontSize: "11px", minWidth: "30px" }}>{Math.round(zoom * 100)}%</span>
        </div>

        <span style={{ color: "#a855f7", fontSize: "12px", fontWeight: "bold" }}>
          {visibleEvents.length} ACCIONES VISIBLES
        </span>
      </div>

      {/* CONTENEDOR DEL MAPA CON ZOOM */}
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
          border: "1px solid #2d3748",
          overflow: zoom > 1 ? "auto" : "hidden", // Permite scroll si hay mucho zoom
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div style={{
          width: "100%",
          height: "100%",
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease-out",
          position: "relative"
        }}>
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
                zIndex: 100,
                border: "1px solid #334155",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
              }}
            >
              <div><b>Jugador:</b> {tooltip.data.jugador ?? "N/A"}</div>
              <div><b>Evento:</b> {tooltip.data.event}</div>
              <div><b>Posición:</b> {tooltip.data.x}x, {tooltip.data.y}y</div>
            </div>
          )}

          <svg viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`} width="100%" height="100%">
            <rect x="0" y="0" width={FIELD_WIDTH} height={FIELD_HEIGHT} fill="#235d44" />

            <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" fill="none">
              <rect x="0" y="0" width={FIELD_WIDTH} height={FIELD_HEIGHT} />
              <line x1={FIELD_WIDTH / 2} y1="0" x2={FIELD_WIDTH / 2} y2={FIELD_HEIGHT} />
              <circle cx={FIELD_WIDTH / 2} cy={FIELD_HEIGHT / 2} r="9.15" />
              <rect x="0" y={(FIELD_HEIGHT - 40.3) / 2} width="16.5" height="40.3" />
              <rect x={FIELD_WIDTH - 16.5} y={(FIELD_HEIGHT - 40.3) / 2} width="16.5" height="40.3" />
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
                      x1={x} y1={y}
                      x2={(e.x2 / 100) * FIELD_WIDTH}
                      y2={FIELD_HEIGHT - (e.y2 / 100) * FIELD_HEIGHT}
                      stroke={color}
                      strokeWidth="0.4"
                      opacity="0.5"
                      markerEnd="url(#arrow)"
                    />
                  )}
                  <circle
                    cx={x} cy={y}
                    r={selectedPlayers.length > 0 ? "1.2" : "0.8"}
                    fill={color}
                    stroke="#fff"
                    strokeWidth="0.15"
                    style={{ cursor: "pointer" }}
                    onMouseMove={(ev) => {
                      const rect = ev.currentTarget.ownerSVGElement.getBoundingClientRect();
                      setTooltip({ x: (ev.clientX - rect.left) / zoom, y: (ev.clientY - rect.top) / zoom, data: e });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MagicHeatmap;