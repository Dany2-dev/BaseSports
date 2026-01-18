console.log("PITCH COMPONENT CARGADO");

export default function Pitch({ eventos = [] }) {
  const events = eventos;

  /* ===== DEBUG GENERAL ===== */
  console.log("EVENTOS RECIBIDOS EN PITCH:", events.length);
  console.log("PRIMER EVENTO (sample):", events[0]);

  const WIDTH = 700;
  const HEIGHT = 450;

  /* Escalas (datos 0–100) */
  const scaleX = (x) => (x / 100) * WIDTH;
  const scaleY = (y) => HEIGHT - (y / 100) * HEIGHT; // invertir Y para SVG

  const colorEvento = (event = "") => {
    const e = event.toLowerCase();
    if (e.includes("gol") || e.includes("goal")) return "#22c55e";
    if (e.includes("shot") || e.includes("tiro") || e.includes("remate")) return "#facc15";
    if (e.includes("pase incompleto") || e.includes("centro incompleto")) return "#ef4444";
    if (e.includes("pase") || e.includes("centro")) return "#38bdf8";
    return "#e5e7eb";
  };

  return (
    <div className="overflow-x-auto">
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ background: "#166534" }}
      >
        {/* ===== CAMPO ===== */}
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#166534" />

        {/* Líneas exteriores */}
        <rect
          x="5"
          y="5"
          width={WIDTH - 10}
          height={HEIGHT - 10}
          fill="none"
          stroke="white"
          strokeWidth="2"
        />

        {/* Línea media */}
        <line
          x1={WIDTH / 2}
          y1={5}
          x2={WIDTH / 2}
          y2={HEIGHT - 5}
          stroke="white"
          strokeWidth="2"
        />

        {/* Círculo central */}
        <circle
          cx={WIDTH / 2}
          cy={HEIGHT / 2}
          r={HEIGHT * 0.15}
          stroke="white"
          strokeWidth="2"
          fill="none"
        />

        {/* ===== CARRILES (HORIZONTALES) ===== */}
        <line
          x1={0}
          y1={HEIGHT / 3}
          x2={WIDTH}
          y2={HEIGHT / 3}
          stroke="white"
          strokeDasharray="6,6"
        />
        <line
          x1={0}
          y1={(2 * HEIGHT) / 3}
          x2={WIDTH}
          y2={(2 * HEIGHT) / 3}
          stroke="white"
          strokeDasharray="6,6"
        />

        {/* ===== EVENTOS ===== */}
        {events.map((e, i) => {
          /* Convertir a número (MUY IMPORTANTE) */
          const x = Number(e.x);
          const y = Number(e.y);
          const x2 = e.x2 !== null ? Number(e.x2) : null;
          const y2 = e.y2 !== null ? Number(e.y2) : null;

          /* DEBUG FINO (temporal) */
          console.log(`EVENTO ${i}`, {
            x, y, x2, y2, event: e.event
          });

          const color = colorEvento(e.event);

          return (
            <g key={i}>
              {/* Flecha (solo si hay destino, 0 es válido) */}
              {x2 !== null && y2 !== null &&! (x2 === 0 && y2 === 0)&& (
                <line
                  x1={scaleX(x)}
                  y1={scaleY(y)}
                  x2={scaleX(x2)}
                  y2={scaleY(y2)}
                  stroke={color}
                  strokeWidth={2}
                  opacity={0.8}
                />
              )}

              {/* Punto inicio */}
              <circle
                cx={scaleX(x)}
                cy={scaleY(y)}
                r={4}
                fill={color}
                stroke="white"
                strokeWidth={0.5}
              />
              {/* ===== ÁREAS Y PORTERÍAS ===== */}

              /* === ÁREA GRANDE IZQUIERDA === */
              <rect
                x={5}
                y={(HEIGHT - (40.3 / 68) * HEIGHT) / 2}
                width={(16.5 / 105) * WIDTH}
                height={(40.3 / 68) * HEIGHT}
                fill="none"
                stroke="white"
                strokeWidth="2"
              />

              /* === ÁREA CHICA IZQUIERDA === */
              <rect
                x={5}
                y={(HEIGHT - (18.32 / 68) * HEIGHT) / 2}
                width={(5.5 / 105) * WIDTH}
                height={(18.32 / 68) * HEIGHT}
                fill="none"
                stroke="white"
                strokeWidth="2"
              />


              /* === ÁREA GRANDE DERECHA === */
              <rect
                x={WIDTH - (16.5 / 105) * WIDTH - 5}
                y={(HEIGHT - (40.3 / 68) * HEIGHT) / 2}
                width={(16.5 / 105) * WIDTH}
                height={(40.3 / 68) * HEIGHT}
                fill="none"
                stroke="white"
                strokeWidth="2"
              />

              /* === ÁREA CHICA DERECHA === */
              <rect
                x={WIDTH - (5.5 / 105) * WIDTH - 5}
                y={(HEIGHT - (18.32 / 68) * HEIGHT) / 2}
                width={(5.5 / 105) * WIDTH}
                height={(18.32 / 68) * HEIGHT}
                fill="none"
                stroke="white"
                strokeWidth="2"
              />



            </g>
          );
        })}
      </svg>
    </div>
  );
}
