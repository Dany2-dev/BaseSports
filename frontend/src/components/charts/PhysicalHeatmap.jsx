import React, { useMemo, useState, useEffect, useRef } from "react";

const FIELD_LENGTH = 105;
const FIELD_WIDTH = 68;

const API_URL = import.meta.env.VITE_API_URL;

const PhysicalHeatmap = ({ initialData = [], equipoId }) => {
  const canvasRef = useRef(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerImages, setPlayerImages] = useState({});

  // 0. Cargar imágenes de los jugadores
  useEffect(() => {
    if (!equipoId) return;
    fetch(`${API_URL}/equipos/${equipoId}/jugadores`)
      .then(res => res.json())
      .then(data => {
        const imgMap = {};
        data.forEach(p => {
          imgMap[p.id] = p.imagen_url;
        });
        setPlayerImages(imgMap);
      })
      .catch(err => console.error("Error loading player images:", err));
  }, [equipoId]);

  // 1. Procesar lista de jugadores
  const playersMap = useMemo(() => {
    if (!Array.isArray(initialData)) return [];
    const map = new Map();
    initialData.forEach(e => {
      if (e.id_jugador && !map.has(e.id_jugador)) {
        map.set(e.id_jugador, e.nombre || `Jugador ${e.id_jugador}`);
      }
    });
    const list = Array.from(map.entries()).map(([id, nombre]) => ({ id: Number(id), nombre }));
    if (list.length > 0 && !selectedPlayer) setSelectedPlayer(list[0].id);
    return list;
  }, [initialData]);

  const currentPlayer = playersMap.find(p => p.id === selectedPlayer);

  // 2. Filtrar eventos del jugador
  const heatPoints = useMemo(() => {
    return initialData.filter(e => e.id_jugador === selectedPlayer && e.x != null && e.y != null);
  }, [initialData, selectedPlayer]);

  // 3. LÓGICA DE DIBUJO DE NUBE (Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    // Limpiar
    ctx.clearRect(0, 0, width, height);

    if (heatPoints.length === 0) return;

    // Crear un canvas temporal para los puntos difuminados
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");

    // Dibujar cada punto como un gradiente radial (la "mancha")
    heatPoints.forEach(p => {
      const x = (p.x / 100) * width;
      const y = (p.y / 100) * height; // Ajustar según origen de coordenadas

      const radius = 35; // Radio de la nube
      const gradient = tempCtx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, "rgba(0, 0, 0, 1)"); // El color no importa aquí, solo el Alpha
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      tempCtx.fillStyle = gradient;
      tempCtx.beginPath();
      tempCtx.arc(x, y, radius, 0, Math.PI * 2);
      tempCtx.fill();
    });

    // Aplicar el mapa de colores basado en la opacidad
    const imgData = tempCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3]; // Intensidad basada en transparencia
      if (alpha > 0) {
        // Lógica de color: Azul -> Cian -> Verde -> Amarillo -> Rojo
        if (alpha < 50) { // Frío (Azul/Cian)
          data[i] = 0; data[i + 1] = 150; data[i + 2] = 255;
        } else if (alpha < 120) { // Medio (Verde/Amarillo)
          data[i] = 0; data[i + 1] = 255; data[i + 2] = 100;
        } else if (alpha < 180) { // Calor (Naranja)
          data[i] = 255; data[i + 1] = 200; data[i + 2] = 0;
        } else { // Muy caliente (Rojo)
          data[i] = 255; data[i + 1] = 30; data[i + 2] = 0;
        }
        // Suavizar la transparencia final para que se vea como nube
        data[i + 3] = alpha * 0.7;
      }
    }
    ctx.putImageData(imgData, 0, 0);

  }, [heatPoints]);

  return (
    <div style={styles.outerWrapper}>
      {/* HEADER PROFESIONAL */}
      <div style={styles.header}>
        <div style={styles.playerProfile}>
          <div style={styles.avatarContainer}>
            <div style={styles.imageRing}>
              <img
                src={playerImages[selectedPlayer] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%2364748b'/%3E%3C/svg%3E"}
                alt=""
                style={styles.avatar}
                onError={(e) => e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%2364748b'/%3E%3C/svg%3E"}
              />
            </div>
          </div>
          <div style={styles.playerTextInfo}>
            <span style={styles.playerName}>{currentPlayer?.nombre || "Cargando..."}</span>
            <span style={styles.playerSub}>ANÁLISIS DE POSICIONAMIENTO</span>
          </div>
        </div>

        <div style={styles.selectWrapper}>
          <select
            value={selectedPlayer ?? ""}
            onChange={e => setSelectedPlayer(Number(e.target.value))}
            style={styles.select}
          >
            {playersMap.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* CONTENEDOR DE CANCHA */}
      <div style={styles.pitchWrapper}>
        <div style={styles.dataTag}>
          <span style={styles.glowText}>{heatPoints.length}</span> REGISTROS
        </div>

        <div style={styles.canvasContainer}>
          {/* Capa 1: Fondo de césped */}
          <div style={styles.grassBackground} />

          {/* Capa 2: Canvas de la Nube */}
          <canvas
            ref={canvasRef}
            width={800} // Resolución interna fija para calidad
            height={518}
            style={styles.canvas}
          />

          {/* Capa 3: Líneas de la Cancha SVG */}
          <svg viewBox={`0 0 ${FIELD_LENGTH} ${FIELD_WIDTH}`} style={styles.svgOverlay}>
            <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" fill="none">
              <rect x="0" y="0" width={FIELD_LENGTH} height={FIELD_WIDTH} />
              <line x1={FIELD_LENGTH / 2} y1="0" x2={FIELD_LENGTH / 2} y2={FIELD_WIDTH} />
              <circle cx={FIELD_LENGTH / 2} cy={FIELD_WIDTH / 2} r="9.15" />
              <rect x="0" y="13.85" width="16.5" height="40.3" />
              <rect x={FIELD_LENGTH - 16.5} y="13.85" width="16.5" height="40.3" />
              <rect x="0" y="24.85" width="5.5" height="18.3" />
              <rect x={FIELD_LENGTH - 5.5} y="24.85" width="5.5" height="18.3" />
            </g>
          </svg>
        </div>

        <div style={styles.footer}>
          <div style={styles.legend}>
            <span>BAJA INTENSIDAD</span>
            <div style={styles.gradientBar} />
            <span>ALTA</span>
          </div>
          <span style={styles.direction}>ATAQUE ▶</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  outerWrapper: {
    padding: "1.5rem",
    background: "#0a0c10",
    borderRadius: "24px",
    maxWidth: "800px",
    margin: "0 auto",
    color: "#fff",
    fontFamily: "'Inter', sans-serif"
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  playerProfile: { display: "flex", alignItems: "center", gap: "12px" },
  avatarContainer: { position: "relative" },
  imageRing: {
    width: "50px",
    height: "50px",
    borderRadius: "15px",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    padding: "2px"
  },
  avatar: { width: "100%", height: "100%", borderRadius: "13px", objectFit: "cover", background: "#1a1c23" },
  playerTextInfo: { display: "flex", flexDirection: "column" },
  playerName: { fontSize: "1.1rem", fontWeight: "bold", letterSpacing: "-0.5px" },
  playerSub: { fontSize: "0.65rem", color: "#94a3b8", fontWeight: "600" },
  select: {
    background: "#161b22",
    color: "#fff",
    border: "1px solid #30363d",
    padding: "8px 12px",
    borderRadius: "10px",
    outline: "none",
    fontSize: "0.85rem"
  },
  pitchWrapper: { position: "relative", borderRadius: "12px", overflow: "hidden" },
  canvasContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: "105/68",
    background: "#0d1117"
  },
  grassBackground: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at center, #143d2a 0%, #0a2418 100%)",
    zIndex: 0
  },
  canvas: {
    position: "absolute",
    top: 0, left: 0,
    width: "100%", height: "100%",
    zIndex: 1,
    filter: "blur(2px)" // Difuminado extra para naturalidad
  },
  svgOverlay: {
    position: "absolute",
    top: 0, left: 0,
    width: "100%", height: "100%",
    zIndex: 2,
    pointerEvents: "none"
  },
  dataTag: {
    position: "absolute",
    top: "10px", right: "10px",
    zIndex: 10,
    fontSize: "0.65rem",
    background: "rgba(0,0,0,0.6)",
    padding: "4px 8px",
    borderRadius: "6px",
    backdropFilter: "blur(4px)"
  },
  glowText: { color: "#60a5fa", fontWeight: "bold" },
  footer: { display: "flex", justifyContent: "space-between", padding: "10px 5px" },
  legend: { display: "flex", alignItems: "center", gap: "8px", fontSize: "0.6rem", color: "#484f58" },
  gradientBar: {
    width: "80px", height: "4px", borderRadius: "2px",
    background: "linear-gradient(to right, #3b82f6, #22c55e, #eab308, #ef4444)"
  },
  direction: { fontSize: "0.6rem", color: "#30363d", fontWeight: "800" }
};

export default PhysicalHeatmap;