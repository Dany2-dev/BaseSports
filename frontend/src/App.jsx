import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";

import Login from "./pages/Login";
import SelectEquipo from "./pages/SelectEquipo";
import Dashboard from "./pages/Dashboard";

import StaggeredMenu from "./components/ui/StaggeredMenu";

function AppLayout() {
  const location = useLocation();

  // Ocultar menú solo en login
  const hideMenu = location.pathname === "/login";

  return (
    <>
      {/* MENÚ CORREGIDO PARA VISIBILIDAD */}
      {!hideMenu && (
        <StaggeredMenu
          position="left"
          isFixed={true}
          accentColor="#a855f7"          // Morado neón para que combine con tus cards
          menuButtonColor="#ffffff"       // BLANCO PURO: Ahora sí se verá claro
          openMenuButtonColor="#a855f7"   // Cambia a morado al abrir
          items={[
            { label: "Inicio", ariaLabel: "Inicio", link: "/" },
            { label: "Teams", ariaLabel: "Teams", link: "/" },
            { label: "Players", ariaLabel: "Players", link: "/players" },
            { label: "Analysis", ariaLabel: "Analysis", link: "/dashboard/5" },
            { label: "Reports", ariaLabel: "Reports", link: "/reports" },
            { label: "Settings", ariaLabel: "Settings", link: "/settings" },
          ]}
        />
      )}

      {/* Contenido principal */}
      <div className="min-h-screen bg-slate-900 text-slate-200">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <SelectEquipo />
              </RequireAuth>
            }
          />

          <Route
            path="/dashboard/:equipoId"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;