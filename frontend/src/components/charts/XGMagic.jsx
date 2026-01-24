import React, { useMemo, useState } from "react";

/* ================== CONFIGURACIÓN CANCHA (FIFA) ================== */
const FIELD_LENGTH = 105;
const FIELD_WIDTH = 68;
const GOAL_WIDTH = 7.32;

const COEFS = { intercept: -1.5, distance: -0.08, angle: 1.2 };
const sigmoid = (z) => 1 / (1 + Math.exp(-z));

const calculateMetrics = (xPct, yPct) => {
  const xMeters = (xPct / 100) * FIELD_LENGTH;
  const yMeters = (yPct / 100) * FIELD_WIDTH;
  const targetX = xPct > 50 ? FIELD_LENGTH : 0;
  const dx = Math.abs(targetX - xMeters);
  const dy = Math.abs((FIELD_WIDTH / 2) - yMeters);
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.abs(
    Math.atan2(dy + GOAL_WIDTH / 2, dx) - Math.atan2(dy - GOAL_WIDTH / 2, dx)
  );
  return { distance, angle, xMeters, yMeters };
};

const XGMagic = ({ initialData }) => {
  const [hoveredShot, setHoveredShot] = useState(null);

  const shotsWithXG = useMemo(() => {
    const data = Array.isArray(initialData) ? initialData : [];
    return data
      .filter(e => e.x != null && e.y != null && 
        (e.event?.toLowerCase().includes("tiro") || e.event?.toLowerCase().includes("remate")))
      .map(s => {
        const { distance, angle, xMeters, yMeters } = calculateMetrics(s.x, s.y);
        const z = COEFS.intercept + (COEFS.distance * distance) + (COEFS.angle * angle);
        const xg = sigmoid(z);

        return {
          ...s,
          distance,
          angle,
          xg,
          renderX: xMeters,
          renderY: FIELD_WIDTH - yMeters,
          // Coordenadas de destino (si existen)
          renderX2: s.x2 != null ? (s.x2 / 100) * FIELD_LENGTH : null,
          renderY2: s.y2 != null ? FIELD_WIDTH - (s.y2 / 100) * FIELD_WIDTH : null
        };
      });
  }, [initialData]);

  const totalXG = shotsWithXG.reduce((acc, s) => acc + s.xg, 0);

  return (
    <div style={{ width: "100%", position: "relative", padding: "20px", background: "#0a0a0f", borderRadius: "16px" }}>
      
      <div style={{ position: "relative", width: "100%", aspectRatio: "105/68", overflow: "visible" }}>
        <svg
            viewBox={`0 0 ${FIELD_LENGTH} ${FIELD_WIDTH}`}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid"
            >
            {/* Fondo */}
            <rect width={FIELD_LENGTH} height={FIELD_WIDTH} fill="#143d2a" />

            {/* Líneas */}
            <g stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" fill="none">
                {/* Contorno */}
                <rect width={FIELD_LENGTH} height={FIELD_WIDTH} />

                {/* Medio campo */}
                <line x1={FIELD_LENGTH / 2} y1="0" x2={FIELD_LENGTH / 2} y2={FIELD_WIDTH} />
                <circle cx={FIELD_LENGTH / 2} cy={FIELD_WIDTH / 2} r="9.15" />

                {/* Áreas grandes */}
                <rect x="0" y={(FIELD_WIDTH - 40.3) / 2} width="16.5" height="40.3" />
                <rect x={FIELD_LENGTH - 16.5} y={(FIELD_WIDTH - 40.3) / 2} width="16.5" height="40.3" />

                {/* Áreas chicas */}
                <rect x="0" y={(FIELD_WIDTH - 18.32) / 2} width="5.5" height="18.32" />
                <rect x={FIELD_LENGTH - 5.5} y={(FIELD_WIDTH - 18.32) / 2} width="5.5" height="18.32" />

                {/* Puntos */}
                <circle cx={FIELD_LENGTH / 2} cy={FIELD_WIDTH / 2} r="0.6" fill="white" />
                <circle cx="11" cy={FIELD_WIDTH / 2} r="0.6" fill="white" />
                <circle cx={FIELD_LENGTH - 11} cy={FIELD_WIDTH / 2} r="0.6" fill="white" />

                {/* Arcos */}
                <path
                d={`M16.5 ${(FIELD_WIDTH / 2) - 9.15}
                    A9.15 9.15 0 0 1 16.5 ${(FIELD_WIDTH / 2) + 9.15}`}
                />
                <path
                d={`M${FIELD_LENGTH - 16.5} ${(FIELD_WIDTH / 2) - 9.15}
                    A9.15 9.15 0 0 0 ${FIELD_LENGTH - 16.5} ${(FIELD_WIDTH / 2) + 9.15}`}
                />
            </g>

            {/* ================= TIROS Y TRAYECTORIAS (TU CÓDIGO, IGUAL) ================= */}
            {shotsWithXG.map((s, i) => {
                const color = s.xg > 0.3 ? "#ef4444" : s.xg > 0.15 ? "#f97316" : "#facc15";
                const isHovered = hoveredShot?.data === s;

                return (
                <g key={i}>
                    {s.renderX2 !== null && (
                    <line
                        x1={s.renderX}
                        y1={s.renderY}
                        x2={s.renderX2}
                        y2={s.renderY2}
                        stroke={isHovered ? "white" : color}
                        strokeWidth={isHovered ? 0.6 : 0.3}
                        strokeDasharray={isHovered ? "none" : "1, 1"}
                        opacity={isHovered ? 1 : 0.4}
                        markerEnd={isHovered ? "url(#arrowhead)" : "none"}
                    />
                    )}

                    <circle
                    cx={s.renderX}
                    cy={s.renderY}
                    r={isHovered ? (0.8 + (s.xg * 5)) * 1.5 : 0.8 + (s.xg * 5)}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={isHovered ? 0.4 : 0.1}
                    onMouseEnter={(e) => {
                        const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                        setHoveredShot({
                        x: (s.renderX / FIELD_LENGTH) * rect.width,
                        y: (s.renderY / FIELD_WIDTH) * rect.height,
                        data: s
                        });
                    }}
                    onMouseLeave={() => setHoveredShot(null)}
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                    />
                </g>
                );
            })}
            </svg>


        {hoveredShot && (
          <div style={{
            position: "absolute",
            left: hoveredShot.x,
            top: hoveredShot.y,
            transform: hoveredShot.data.renderX > 80 ? "translate(-110%, -110%)" : "translate(10%, -110%)",
            background: "rgba(10, 10, 20, 0.95)",
            border: `1px solid ${hoveredShot.data.xg > 0.3 ? "#ef4444" : "#8400ff"}`,
            padding: "10px",
            borderRadius: "8px",
            color: "white",
            fontSize: "12px",
            zIndex: 1000,
            pointerEvents: "none",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            minWidth: "150px"
          }}>
            <div style={{ color: "#8400ff", fontWeight: "bold", marginBottom: "4px" }}>
              {hoveredShot.data.jugador || "Jugador"}
            </div>
            <div>Distancia: <b>{hoveredShot.data.distance.toFixed(2)}m</b></div>
            <div>xG: <b style={{ fontSize: "14px", color: "#facc15" }}>{hoveredShot.data.xg.toFixed(3)}</b></div>
            {hoveredShot.data.renderX2 && (
              <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px italic" }}>
                → Dirección visible en mapa
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: "15px", textAlign: "right", color: "white" }}>
        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>TOTAL XG: </span>
        <b style={{ fontSize: "1.2rem", color: "#8400ff" }}>{totalXG.toFixed(2)}</b>
      </div>
    </div>
  );
};

export default XGMagic;