import React, { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";

const FIELD_LENGTH = 105;
const FIELD_WIDTH = 68;

const PhysicalHeatmap = ({ initialData = [], playerImageUrl, teamLogoUrl }) => {
  /* ===========================
     MAPA DE JUGADORES
  =========================== */
  const playersMap = useMemo(() => {
    if (!Array.isArray(initialData)) return [];
    const map = new Map();
    initialData.forEach(e => {
      if (e.id_jugador && !map.has(e.id_jugador)) {
        map.set(e.id_jugador, e.nombre || `Player ${e.id_jugador}`);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({
      id: Number(id),
      nombre
    }));
  }, [initialData]);

  const [selectedPlayer, setSelectedPlayer] = useState(
    playersMap[0]?.id || null
  );

  const currentPlayer = playersMap.find(p => p.id === selectedPlayer);

  /* ===========================
     DATOS PARA LA NUBE
     (EVENTOS REALES)
  =========================== */
  const scatterData = useMemo(() => {
    if (!selectedPlayer) return [];

    return initialData
      .filter(
        e =>
          e.id_jugador === selectedPlayer &&
          e.x != null &&
          e.y != null
      )
      .map(e => [e.x, e.y, 1]);
  }, [initialData, selectedPlayer]);

  /* ===========================
     OPCIÓN ECHARTS
  =========================== */
  const getOption = () => ({
    backgroundColor: "transparent",
    animation: false,
    grid: { left: 0, top: 0, right: 0, bottom: 0 },

    xAxis: {
      type: "value",
      min: 0,
      max: FIELD_LENGTH,
      show: false
    },

    yAxis: {
      type: "value",
      min: 0,
      max: FIELD_WIDTH,
      show: false
    },

    visualMap: {
      show: false,
      min: 0,
      max: 5,
      inRange: {
        color: [
          "#0000ff", // azul
          "#00ffff",
          "#ffff00", // amarillo
          "#ff7f00",
          "#ff0000"  // rojo
        ]
      }
    },

    series: [
      {
        type: "effectScatter",
        coordinateSystem: "cartesian2d",
        data: scatterData,
        symbolSize: 18,
        blurSize: 45,
        showEffectOn: "render",
        rippleEffect: { scale: 0 },
        itemStyle: {
          opacity: 0.85
        }
      }
    ]
  });

  /* ===========================
     RENDER
  =========================== */
  return (
    <div style={styles.outerWrapper}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.playerProfile}>
          <div style={styles.avatarContainer}>
            <div style={styles.imageRing}>
              <img
                src={playerImageUrl}
                alt={currentPlayer?.nombre}
                style={styles.avatar}
              />
            </div>
            <div style={styles.statusDot} />
          </div>
          <div style={styles.playerTextInfo}>
            <span style={styles.playerName}>
              {currentPlayer?.nombre || "Seleccionar Jugador"}
            </span>
            <span style={styles.playerSub}>MAPA DE CALOR</span>
          </div>
        </div>

        <div style={styles.selectWrapper}>
          <select
            value={selectedPlayer ?? ""}
            onChange={e => setSelectedPlayer(Number(e.target.value))}
            style={styles.select}
          >
            {playersMap.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <div style={styles.selectIcon}>▾</div>
        </div>
      </div>

      {/* CANCHA */}
      <div style={styles.pitchWrapper}>
        <div style={styles.dataTag}>
          <span style={styles.glowText}>{scatterData.length}</span> ACCIONES
        </div>

        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "105/68",
            background: "#0a1a0a"
          }}
        >
          {/* NUBE DE CALOR */}
          <ReactECharts
            option={getOption()}
            style={{
              height: "100%",
              width: "100%",
              position: "absolute",
              zIndex: 1
            }}
          />

          {/* SVG CANCHA */}
          <svg
            viewBox={`0 0 ${FIELD_LENGTH} ${FIELD_WIDTH}`}
            style={{
              ...styles.svg,
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 2,
              pointerEvents: "none"
            }}
          >
            <g
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.5"
              fill="none"
            >
              <rect
                x="0"
                y="0"
                width={FIELD_LENGTH}
                height={FIELD_WIDTH}
              />
              <line
                x1={FIELD_LENGTH / 2}
                y1="0"
                x2={FIELD_LENGTH / 2}
                y2={FIELD_WIDTH}
              />
              <circle
                cx={FIELD_LENGTH / 2}
                cy={FIELD_WIDTH / 2}
                r="9.15"
              />
              <rect x="0" y="13.85" width="16.5" height="40.3" />
              <rect
                x={FIELD_LENGTH - 16.5}
                y="13.85"
                width="16.5"
                height="40.3"
              />
            </g>
          </svg>
        </div>

        <div style={styles.footer}>
          <span style={styles.direction}>DIRECCIÓN DE ATAQUE ▶</span>
        </div>
      </div>
    </div>
  );
};

/* ===========================
   ESTILOS (IGUALES)
=========================== */
const styles = {
  outerWrapper: {
    padding: "1.2rem",
    background: "#0f1115",
    borderRadius: "16px",
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  playerProfile: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  avatarContainer: { position: "relative" },
  imageRing: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    padding: "2px",
    background: "linear-gradient(135deg, #8400ff, #00f2ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "12px",
    objectFit: "cover"
  },
  statusDot: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    width: "12px",
    height: "12px",
    background: "#10b981",
    borderRadius: "50%"
  },
  playerTextInfo: {
    display: "flex",
    flexDirection: "column"
  },
  playerName: {
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "#fff"
  },
  playerSub: {
    fontSize: "0.65rem",
    color: "#64748b"
  },
  selectWrapper: { position: "relative" },
  select: {
    background: "#1a1c23",
    color: "#fff",
    border: "1px solid #334155",
    padding: "8px 32px 8px 12px",
    borderRadius: "10px"
  },
  selectIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)"
  },
  pitchWrapper: {
    position: "relative",
    borderRadius: "20px",
    overflow: "hidden"
  },
  svg: {
    width: "100%",
    height: "100%"
  },
  dataTag: {
    position: "absolute",
    top: "12px",
    right: "12px",
    zIndex: 10,
    fontSize: "0.7rem",
    color: "#94a3b8"
  },
  glowText: { color: "#00f2ff" },
  footer: {
    padding: "10px"
  },
  direction: {
    fontSize: "0.6rem",
    color: "#3f3f46"
  }
};

export default PhysicalHeatmap;
