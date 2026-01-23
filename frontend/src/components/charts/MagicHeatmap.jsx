import React, { useMemo } from 'react';

const FIELD_WIDTH = 105;
const FIELD_HEIGHT = 68;

// 🎨 Colores optimizados: Mantenemos tu lógica pero con variables para legibilidad
const getColor = (event) => {
  if (!event) return "#a855f7";
  
  // Agrupación por familia de eventos
  if (event.includes("Asistencia") || event.includes("Gol")) return "#FACC15"; // Dorado (Éxito total)
  if (event.includes("Pase completo") || event.includes("filtrado")) return "#22C55E"; // Verde (Positivo)
  if (event.includes("incompleto") || event.includes("perdido") || event.includes("fallido")) return "#EF4444"; // Rojo (Pérdida)
  if (event.includes("Duelo") || event.includes("Balon")) return "#3B82F6"; // Azul (Disputa)
  if (event.includes("Tiro") || event.includes("Remate")) return "#FB923C"; // Naranja (Ataque)
  
  return "#94A3B8"; // Gris para otros
};

const MagicHeatmap = ({ initialData, activeEventTypes = [] }) => {
  // ✅ Memorizamos el filtrado para evitar cálculos pesados en cada render
  const visibleEvents = useMemo(() => {
    const events = Array.isArray(initialData)
      ? initialData.filter(e => e.x !== null && e.y !== null)
      : [];

    if (activeEventTypes.length === 0) return events;
    return events.filter(e => activeEventTypes.includes(e.event));
  }, [initialData, activeEventTypes]);

  return (
    <div
      className="heatmap-wrapper"
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        aspectRatio: `${FIELD_WIDTH} / ${FIELD_HEIGHT}`,
        background: "#1a202c", // Fondo ligeramente más oscuro para resaltar la grama
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}
    >
      <svg
        viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ================= CANCHA (DISEÑO REFORZADO) ================= */}
        <rect x="0" y="0" width={FIELD_WIDTH} height={FIELD_HEIGHT} fill="#235d44" />
        
        {/* Líneas perimetrales y centrales */}
        <g stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" fill="none">
          <rect x="0" y="0" width={FIELD_WIDTH} height={FIELD_HEIGHT} />
          <line x1={FIELD_WIDTH / 2} y1="0" x2={FIELD_WIDTH / 2} y2={FIELD_HEIGHT} />
          <circle cx={FIELD_WIDTH / 2} cy={FIELD_HEIGHT / 2} r="9.15" />
          
          {/* Áreas Grandes */}
          <rect x="0" y={(FIELD_HEIGHT - 40.3) / 2} width="16.5" height="40.3" />
          <rect x={FIELD_WIDTH - 16.5} y={(FIELD_HEIGHT - 40.3) / 2} width="16.5" height="40.3" />

          {/* Áreas Chicas */}
          <rect x="0" y={(FIELD_HEIGHT - 18.32) / 2} width="5.5" height="18.32" />
          <rect x={FIELD_WIDTH - 5.5} y={(FIELD_HEIGHT - 18.32) / 2} width="5.5" height="18.32" />

          {/* Arcos de las Áreas (D) */}
          <path d={`M16.5 ${(FIELD_HEIGHT / 2) - 7.3} A9.15 9.15 0 0 1 16.5 ${(FIELD_HEIGHT / 2) + 7.3}`} />
          <path d={`M${FIELD_WIDTH - 16.5} ${(FIELD_HEIGHT / 2) - 7.3} A9.15 9.15 0 0 0 ${FIELD_WIDTH - 16.5} ${(FIELD_HEIGHT / 2) + 7.3}`} />
        </g>

        {/* Puntos de referencia */}
        <g fill="rgba(255,255,255,0.8)">
          <circle cx="11" cy={FIELD_HEIGHT / 2} r="0.4" />
          <circle cx={FIELD_WIDTH - 11} cy={FIELD_HEIGHT / 2} r="0.4" />
          <circle cx={FIELD_WIDTH / 2} cy={FIELD_HEIGHT / 2} r="0.4" />
        </g>

        {/* ================= EVENTOS Y FLECHAS ================= */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="context-fill" />
          </marker>
        </defs>

        {visibleEvents.map((e, i) => {
          const x = (e.x / 100) * FIELD_WIDTH;
          const y = FIELD_HEIGHT - (e.y / 100) * FIELD_HEIGHT;

          const color = getColor(e.event);

          // Lógica original de flechas conservada
          const hasArrow = e.x2 != null && e.y2 != null && Number(e.x2) > 0.1;

          return (
            <g key={`event-${i}`} style={{ cursor: 'pointer' }}>
              {hasArrow && (
                <line
                  x1={x}
                  y1={y}
                  x2={(e.x2 / 100) * FIELD_WIDTH}
                  y2={(e.y2 / 100) * FIELD_HEIGHT}
                  stroke={color}
                  strokeWidth="0.5"
                  opacity="0.6"
                  markerEnd="url(#arrow)"
                  style={{ transition: 'all 0.3s' }}
                />
              )}

              <circle
                cx={x}
                cy={y}
                r="0.8"
                fill={color}
                opacity="0.9"
                stroke="#fff"
                strokeWidth="0.1"
              >
                <title>
                  {`Jugador: ${e.id_jugador || 'N/A'}\nEvento: ${e.event}\nPos: ${e.x}%, ${e.y}%`}
                </title>
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default MagicHeatmap;