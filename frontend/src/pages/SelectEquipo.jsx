import { useEffect, useState } from "react";
import api from "../services/api";
import Silk from "../components/background/Silk";
import FlowingMenu from "../components/ui/FlowingMenu";
import TextType from "./TextType";
import GradientText from "./GradientText";
import StaggeredMenu from "../components/ui/StaggeredMenu";

export default function SelectEquipo() {
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    api
      .get("/equipos")
      .then(res => setEquipos(res.data))
      .catch(() => setEquipos([]));
  }, []);

  const menuItems = equipos.map(eq => ({
    link: `/dashboard/${eq.id}`,
    text: eq.nombre,
    image: eq.logo_url
  }));

  /* ===== MENÚ LATERAL (AGREGADO, NO MODIFICA NADA) ===== */
  const mainMenuItems = [
  { label: "Overview", ariaLabel: "Overview", link: "/" },
  { label: "Teams", ariaLabel: "Teams", link: "/teams" },
  { label: "Players", ariaLabel: "Players", link: "/players" },
  { label: "Analysis", ariaLabel: "Analysis", link: "/analysis" },
  { label: "Reports", ariaLabel: "Reports", link: "/reports" },
  { label: "Settings", ariaLabel: "Settings", link: "/settings" },
  
];


  const socialItems = [
    { label: "GitHub", link: "https://github.com/Dany2-dev" },
    { label: "LinkedIn", link: "https://linkedin.com" }
  ];
  /* ==================================================== */

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        html, body { margin: 0; padding: 0; width: 100%; height: 100%; background-color: black; overflow: hidden; }
        #root { width: 100%; height: 100vh; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* ===== MENÚ STAGGERED (IZQUIERDA, OVERLAY) ===== */}
      <StaggeredMenu
        position="left"
        items={mainMenuItems}
        socialItems={socialItems}
        displaySocials
        displayItemNumbering={true}
        menuButtonColor="#ffffff"
        openMenuButtonColor="#ffffff"
        changeMenuColorOnOpen={true}
        colors={["#B19EEF", "#5227FF"]}
        accentColor="#5227FF"
        logoUrl="/src/assets/logos/logo-datastrike.png"
        isFixed
      />
      {/* ============================================== */}

      {/* Fondo de Seda Fijo */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <Silk speed={5} scale={1} color="#350085" noiseIntensity={1.4} rotation={0} />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 w-full h-screen flex flex-col">
        
        {/* HEADER: CHOOSE YOUR TEAM */}
        <div className="w-full flex flex-col justify-center items-center pt-10 pb-6 px-4 flex-shrink-0">
          <h1 className="font-sportypo text-center leading-none text-[8vw] md:text-[6vw] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            <GradientText
              colors={["#7f048a", "#FF9FFC", "#B19EEF", "#3b0530"]}
              animationSpeed={6}
              showBorder={false}
              className="tracking-tighter"
            >
              <TextType 
                text={[" SELECT", " YOUR","  TEAM"]}
                typingSpeed={110}
                pauseDuration={2000}
                showCursor={true}
                cursorCharacter="_"
                loop={true}
              />
            </GradientText>
          </h1>
          <p className="text-white/40 mt-1 text-[10px] uppercase tracking-[0.4em] font-light">
            System Terminal / Select Unit
          </p>
        </div>

        {/* CONTENEDOR CON SCROLL PARA LOS EQUIPOS */}
        <div className="flex-1 w-full overflow-y-auto no-scrollbar px-4">
          <div className="w-full max-w-5xl mx-auto py-10"> 
            {menuItems.length > 0 && (
              <FlowingMenu 
                items={menuItems} 
                speed={20}
                marqueeBgColor="#5227ff"
                borderColor="rgba(255,255,255,0.1)"
              />
            )}
          </div>
        </div>

        {/* Footer Fijo */}
        <div className="py-6 text-center flex-shrink-0">
          <p className="text-white/10 text-[9px] uppercase tracking-[0.6em] font-light">
            DanyDev Sistem v 2.0.1
          </p>
        </div>
      </div>
    </div>
  );
}
