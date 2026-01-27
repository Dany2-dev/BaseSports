import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import CardNav from "../components/ui/CardNav";
import MagicBento from "../components/ui/MagicBento";
import api from "../services/api"; // Import api
const logoDataStrike = "/logo-datastrike.png";

/**
 * Dashboard principal corregido.
 * Gestiona el estado global de los datos cargados para sincronizar
 * la subida del Excel con la visualización en las tablas.
 */
export default function Dashboard() {
  const { equipoId } = useParams();

  // Estado para forzar el refresco de componentes hijos si es necesario
  const [refreshKey, setRefreshKey] = useState(0);

  // Estado que almacena los registros crudos (eventos) del Excel
  const [uploadedData, setUploadedData] = useState(null);

  // Estado para el nombre del equipo
  const [equipoNombre, setEquipoNombre] = useState("");

  useEffect(() => {
    // Cargar nombre del equipo
    const fetchEquipo = async () => {
      try {
        // Asumiendo que no hay endpoint individual, traemos todos y filtramos
        // Si hay endpoint individual: api.get(`/equipos/${equipoId}`)
        const res = await api.get("/equipos/");
        const found = res.data.find(e => e.id === Number(equipoId));
        if (found) {
          setEquipoNombre(found.nombre);
        }
      } catch (error) {
        console.error("Error cargando equipo", error);
      }
    };
    fetchEquipo();
  }, [equipoId]);

  /**
   * Maneja la respuesta exitosa del servidor tras subir el Excel.
   * 'data' contiene el array de eventos (los 228 registros vistos en consola).
   */
  const handleUploadSuccess = (data) => {
    console.log("Dashboard: Recibiendo datos de carga exitosa", data);

    // 1. Limpiamos datos anteriores para evitar conflictos
    setUploadedData(null);

    // 2. Usamos un pequeño delay para que React registre el "vacío" 
    // y luego monte la tabla con los datos nuevos
    setTimeout(() => {
      setUploadedData(data);
      setRefreshKey(prev => prev + 1);
    }, 50);
  };
  // Configuración de los ítems del menú de navegación
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
      <main className="pt-32 pb-10 flex flex-col items-center justify-center min-h-screen px-6 border-none">

        {/* Header con Nombre del Equipo */}
        <div className="w-full max-w-7xl flex flex-col justify-start mb-8 z-10 relative">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 uppercase tracking-tighter"
            style={{ fontFamily: "'Racing Sans One', sans-serif", filter: "drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))" }}>
            {equipoNombre || "Cargando..."}
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-transparent mt-2 rounded-full"></div>
        </div>

        <div className="w-full max-w-7xl flex justify-center border-none">
          {/* Pasamos 'initialData' a MagicBento. 
              Este prop contiene los eventos que se sumarán en la tabla.
            */}
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

      {/* 3. Estilos Globales corregidos. 
        Se usa una etiqueta normal para evitar errores de 'non-boolean attribute jsx/global'.
      */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .card-grid, 
        .bento-section,
        .magic-bento-card-container {
            border-bottom: none !important;
            outline: none !important;
            border: none !important;
        }
        body {
            background-color: #020617;
            margin: 0;
            padding: 0;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #020617;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e1b4b;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}