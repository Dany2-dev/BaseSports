import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

import PlayerStatsTable from "../tables/PlayerStatsTable";
import CombinedPassesCharts from "../charts/CombinedPassesCharts";
import ComparativeLossesChart from "../charts/ComparativeLossesChart";
import ProgressivePassesMagic from "../charts/ProgressivePassesMagic";
import MagicHeatmap from "../charts/MagicHeatmap";
import XGMagic from "../charts/XGMagic";
import PhysicalHeatmap from "../charts/PhysicalHeatmap";


const MOBILE_BREAKPOINT = 768;

const cardData = [
  { title: 'HEATMAP', description: 'Track user behavior and patterns', label: 'Tactical', details: 'Análisis profundo de métricas de rendimiento.' },
  { title: 'Balance de Ganadas y Pérdidas', description: 'Vista centralizada de rendimiento individual', label: 'Performance', details: 'Análisis navegable de pases y duelos.' },
  { title: 'PROGRESIVE PASS', description: 'Work together seamlessly in cloud', label: 'Analysis', details: 'Progresión y ruptura de líneas.' },
  { title: 'REGISTRO DE EVENTOS POR JUGADOR', description: 'Desglose detallado de cada acción', label: 'Eficiencia', details: 'Base de datos completa de eventos.' },
  { title: 'xG', description: 'Connect your favorite soccer tools', label: 'Connectivity', details: 'Expected goals.' },
  { title: 'COMPARATIVA DE RENDIMIENTO', description: 'Análisis detallado de acciones', label: 'Estadísticas', details: 'Visualización interactiva de balance.' },
  // --- NUEVAS CARDS AGREGADAS ---
  { title: 'Comparativa entre jugadores', description: 'Análisis de presión y robos', label: 'Defensivo', details: 'Zonas de mayor efectividad en la recuperación.' },
  { title: 'DUELOS INDIVIDUALES', description: 'Éxito en 1vs1 ofensivos y defensivos', label: 'Performance', details: 'Estadísticas comparativas de duelos.' },
  { title: 'DISTRIBUCIÓN DE PASES', description: 'Dirección y longitud del juego', label: 'Análisis', details: 'Mapa de conexiones entre jugadores.' },
  { title: 'Mapa de calor', description: 'Distancia recorrida y sprints', label: 'Atletismo', details: 'Rendimiento físico de alta intensidad.' },
  { title: 'BALÓN PARADO', description: 'Efectividad en corners y faltas', label: 'Estrategia', details: 'Análisis de jugadas de estrategia.' },
  { title: 'REPORTE FINAL', description: 'Resumen ejecutivo del encuentro', label: 'Informe', details: 'Conclusiones clave del analista.' }
];

const ParticleCard = ({ children, className, onClick, isExpanded, disableAnimations }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (disableAnimations || !cardRef.current || isExpanded) return;
    const el = cardRef.current;

    const move = e => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--glow-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty('--glow-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
      el.style.setProperty('--glow-intensity', '1');
    };

    const leave = () => el.style.setProperty('--glow-intensity', '0');

    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);

    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    };
  }, [disableAnimations, isExpanded]);

  return (
    <div ref={cardRef} onClick={onClick} className={className}>
      {children}
    </div>
  );
};

const MagicBento = ({ equipoId, initialData }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [activeEventTypes, setActiveEventTypes] = useState([]);
  const [activePeriodo, setActivePeriodo] = useState("ALL");

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setActiveCardIndex(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const close = e => {
    if (e) e.stopPropagation();
    setActiveCardIndex(null);
  };

  return (
    <div className="bento-wrapper">
      {activeCardIndex !== null && <div className="bento-overlay" onClick={close} />}

      <div className="card-grid">
        {cardData.map((card, index) => {
          const isExpanded = index === activeCardIndex;
          const isHidden = activeCardIndex !== null && !isExpanded;

          return (
            <ParticleCard
              key={index}
              isExpanded={isExpanded}
              className={`magic-bento-card ${isExpanded ? 'is-expanded' : ''} ${isHidden ? 'magic-bento-card--hidden' : ''} magic-bento-card--border-glow cursor-target`}
              onClick={() => !isExpanded && setActiveCardIndex(index)}
              disableAnimations={isMobile}
            >
              {isExpanded && (
                <button className="magic-bento-card__close" onClick={close}>
                  &times;
                </button>
              )}

              <div className="magic-bento-card__content">
                <header className={isExpanded ? "card-header-expanded" : ""}>
                  <span className="magic-bento-card__label">{card.label}</span>
                  <h2 className="magic-bento-card__title">{card.title}</h2>
                  <p className="magic-bento-card__description">{card.description}</p>
                </header>

                {isExpanded && (
                  <div className="magic-bento-card__body">
                    <div className="inner-visualizer">

                      {card.title === "HEATMAP" && (
                        <div className="chart-container-expanded">
                          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                            <button onClick={() => setActivePeriodo("1T")}>1T</button>
                            <button onClick={() => setActivePeriodo("2T")}>2T</button>
                            <button onClick={() => setActivePeriodo("ALL")}>Completo</button>
                          </div>
                          <MagicHeatmap
                            initialData={initialData}
                            activeEventTypes={activeEventTypes}
                            activePeriodo={activePeriodo}
                          />
                        </div>
                      )}

                      {card.title === "PROGRESIVE PASS" && (
                        <div className="chart-container-expanded">
                          <div className="chart-container-expanded">
                            <ProgressivePassesMagic initialData={initialData} />
                          </div>
                        </div>
                      )}

                      {card.title === "Balance de Ganadas y Pérdidas" && (
                        <div className="chart-container-expanded">
                          <CombinedPassesCharts initialData={initialData} />
                        </div>
                      )}

                      {card.title === "REGISTRO DE EVENTOS POR JUGADOR" && (
                        <div className="table-container-expanded">
                          <PlayerStatsTable equipoId={equipoId} preloadedData={initialData} />
                        </div>
                      )}

                      {card.title === "COMPARATIVA DE RENDIMIENTO" && (
                        <div className="chart-container-expanded">
                          <ComparativeLossesChart initialData={initialData} />
                        </div>
                      )}

                      {card.title === "xG" && (
                        <div
                          className="chart-container-expanded"
                          style={{
                            maxWidth: "900px",
                            height: "420px",
                            margin: "2rem auto"
                          }}
                        >
                          <XGMagic initialData={initialData} />
                        </div>
                      )}
                      {card.title === "Mapa de calor" && (
                        <div
                          style={{
                            marginTop: "2.5rem",
                            width: "100%",
                            minHeight: "80vh",
                            overflow: "hidden"
                          }}
                        >
                          <PhysicalHeatmap initialData={initialData} equipoId={equipoId} />
                        </div>
                      )}
                      {/* Fallback para las nuevas cards si aún no tienen un componente asignado */}
                      {!["HEATMAP", "PROGRESIVE PASS", "Balance de Ganadas y Pérdidas", "REGISTRO DE EVENTOS POR JUGADOR", "COMPARATIVA DE RENDIMIENTO", "xG"].includes(card.title) && (
                        <div className="chart-container-expanded" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                          <p>Contenido de {card.title} en desarrollo...</p>
                        </div>
                      )}

                    </div>

                    <footer className="card-footer-expanded">
                      <div className="separator" />
                      <p className="details-text">{card.details}</p>
                      <div style={{ height: '40px' }} />
                    </footer>
                  </div>
                )}
              </div>
            </ParticleCard>
          );
        })}
      </div>
    </div>
  );
};

export default MagicBento;