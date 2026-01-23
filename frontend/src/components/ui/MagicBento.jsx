import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

import PlayerStatsTable from "../tables/PlayerStatsTable";
import CombinedPassesCharts from "../charts/CombinedPassesCharts";
import ComparativeLossesChart from "../charts/ComparativeLossesChart";
import ProgressivePassesMagic from "../charts/ProgressivePassesMagic";
import MagicHeatmap from "../charts/MagicHeatmap";
import EventFilterNav from "../ui/EventFilterNav";

const MOBILE_BREAKPOINT = 768;

const cardData = [
  { title: 'HEATMAP', description: 'Track user behavior and patterns', label: 'Tactical', details: 'Análisis profundo de métricas de rendimiento.' },
  { title: 'Balance de Ganadas y Pérdidas', description: 'Vista centralizada de rendimiento individual', label: 'Performance', details: 'Análisis navegable de pases y duelos.' },
  { title: 'PROGRESIVE PASS', description: 'Work together seamlessly in cloud', label: 'Analysis', details: 'Progresión y ruptura de líneas.' },
  { title: 'REGISTRO DE EVENTOS POR JUGADOR', description: 'Desglose detallado de cada acción', label: 'Eficiencia', details: 'Base de datos completa de eventos.' },
  { title: 'xG', description: 'Connect your favorite soccer tools', label: 'Connectivity', details: 'Expected goals.' },
  { title: 'COMPARATIVA DE RENDIMIENTO', description: 'Análisis detallado de acciones', label: 'Estadísticas', details: 'Visualización interactiva de balance.' }
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
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
  }, [disableAnimations, isExpanded]);
  return <div ref={cardRef} onClick={onClick} className={className}>{children}</div>;
};

const MagicBento = ({ equipoId, initialData }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [activeEventTypes, setActiveEventTypes] = useState([]);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setActiveCardIndex(null); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const close = e => { if (e) e.stopPropagation(); setActiveCardIndex(null); };

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
                <button className="magic-bento-card__close" onClick={close}>&times;</button>
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
                          <EventFilterNav onChange={setActiveEventTypes} />
                          <MagicHeatmap initialData={initialData} activeEventTypes={activeEventTypes} />
                        </div>
                      )}
                      {card.title === "PROGRESIVE PASS" && (
                        <div className="chart-container-expanded">
                          <ProgressivePassesMagic initialData={initialData} />
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
                        <div className="xg-placeholder-full">
                          <div className="glow-icon">⚽</div>
                          <p>Módulo de Probabilidad de Gol en Desarrollo</p>
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