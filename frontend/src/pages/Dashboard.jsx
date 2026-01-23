import { useParams } from "react-router-dom";
import { useState } from "react";
import CardNav from "../components/ui/CardNav";
import MagicBento from "../components/ui/MagicBento"; 
import logoDataStrike from "../assets/logos/logo-datastrike.png"; 
import TargetCursor from "../components/ui/TargetCursor";

/**
 * Dashboard principal corregido.
 * - Fix Overlay total para MagicBento.
 * - Scrollbar más opaco y discreto.
 * - Estabilidad visual de layout.
 */
export default function Dashboard() {
  const { equipoId } = useParams();
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadedData, setUploadedData] = useState(null); 

  const handleUploadSuccess = (data) => {
    console.log("Dashboard: Recibiendo datos de carga exitosa", data);
    setUploadedData(data);
    setRefreshKey(prev => prev + 1);
  };

  const menuItems = [
    {
      label: "Análisis",
      links: [
        { label: "Rendimiento", path: `/dashboard/${equipoId}/stats` },
        { label: "Táctica", path: `/dashboard/${equipoId}/tactic` },
      ]
    },
    {
      label: "Plantilla",
      links: [
        { label: "Jugadores", path: `/dashboard/${equipoId}/players` },
        { label: "Mercado", path: `/dashboard/${equipoId}/market` },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden border-none">
      
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
        hoverDuration={0.2}
        targetSelector=".cursor-target"
      />

      {/* 1. Navegación Superior */}
      <CardNav 
        items={menuItems}
        logo={logoDataStrike}
        logoAlt="DataStrike Logo"
        baseColor="#0f172a"
        menuColor="#a855f7" 
        buttonBgColor="#7e22ce" 
        buttonTextColor="#fff"
        onUploadSuccess={handleUploadSuccess}
      />
      
      {/* 2. Área de Contenido Principal */}
      <main className="pt-32 pb-10 flex flex-col items-center min-h-screen px-6 border-none w-full relative z-10">
        
        {/* Encabezado */}
        <div className="w-full max-w-7xl mb-8 text-left px-4 flex-shrink-0 cursor-target">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {equipoId ? equipoId.replace(/-/g, ' ') : "Cargando equipo..."}
            </span>
          </h1>
          <div className="h-1 w-20 bg-purple-600 mt-2 rounded-full"></div>
        </div>

        {/* Contenedor MagicBento */}
        <div className="w-full max-w-7xl flex justify-center border-none min-h-[600px]">
          <MagicBento 
            key={refreshKey} 
            equipoId={equipoId} 
            initialData={uploadedData} 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={false}
            enableMagnetism={false}
            clickEffect={true}
            spotlightRadius={600}
            particleCount={12}
            glowColor="132, 0, 255"
            disableAnimations={false}
          />
        </div>

      </main>

      {/* 3. Estilos Globales Corregidos */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Evita saltos y asegura fondo total */
            html, body {
              min-height: 100%;
              height: auto;
              overflow-x: hidden;
              overflow-y: auto;
            }

            /* FIX OVERLAY TOTAL: Se asegura de que cubra absolutamente todo */
            .bento-overlay {
              position: fixed;
              inset: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.9);
              backdrop-filter: blur(10px);
              z-index: 99999;
              outline: 5px solid red;
            }


            /* Bloquea el scroll del fondo cuando una tarjeta está abierta */
            body:has(.is-expanded) {
              overflow: hidden !important;
            }

            /* Ocultar esquinas del cursor en modo expandido */
            body:has(.is-expanded) .target-cursor-corner {
              opacity: 0 !important;
              visibility: hidden !important;
            }

            body:has(.is-expanded) .target-cursor-dot {
              opacity: 1 !important;
            }
            .magic-bento-card-container {
              /* Aseguramos que el contenedor no limite a la tarjeta fija */
              perspective: none !important; 
              transform: none !important;
            }
            .card-grid, .bento-section, .magic-bento-card-container {
              border: none !important;
              outline: none !important;
            }
            .card-nav-container {
              z-index: 9999 !important;
            }

            /* SCROLLBAR MÁS OPACO Y DISCRETO */
            ::-webkit-scrollbar {
              width: 6px;
            }

            ::-webkit-scrollbar-track {
              background: #020617;
            }

            ::-webkit-scrollbar-thumb {
              /* Color muy oscuro y sutil */
              background: rgba(30, 27, 75, 0.4); 
              border-radius: 10px;
            }

            ::-webkit-scrollbar-thumb:hover {
              background: rgba(132, 0, 255, 0.2);
            }
          `
        }}
      />
    </div>
  );
}