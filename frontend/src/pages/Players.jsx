import { useEffect, useMemo, useState } from "react";

// Cambia esto en tu frontend
const API = import.meta.env.VITE_API_URL;

const PAGE_SIZE = 10;

const normalize = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [equipoFiltro, setEquipoFiltro] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const eqRes = await fetch(`${API}/equipos/`);
        const eqData = await eqRes.json();
        setEquipos(eqData);

        const requests = eqData.map(e =>
          fetch(`${API}/equipos/${e.id}/jugadores`)
            .then(r => r.json())
            .then(js =>
              js.map(j => ({
                id: j.id,
                nombre: j.nombre,
                posicion: j.posicion || "-",
                equipo: e.nombre,
                imagen_url: j.imagen_url
              }))
            )
        );

        const allPlayers = (await Promise.all(requests)).flat();
        setPlayers(allPlayers);
      } catch (e) {
        console.error("Error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const searchN = normalize(search);
    return players.filter(p => {
      const nombreMatch = normalize(p.nombre).includes(searchN);
      const equipoMatch = equipoFiltro === "ALL" || p.equipo === equipoFiltro;
      const idMatch = p.id?.toString().includes(search);
      return (nombreMatch || idMatch) && equipoMatch;
    });
  }, [players, search, equipoFiltro]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return (
    <div style={{ background: 'var(--background-dark)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="magic-bento-card__label">Iniciando Sistemas...</div>
    </div>
  );

  return (
    <div style={{ background: "var(--background-dark)", minHeight: "100vh", color: "var(--white)" }}>
      <div className="card-grid">

        {/* CARD PRINCIPAL: TABLA DE JUGADORES */}
        <div className="magic-bento-card magic-bento-card--border-glow" style={{ gridColumn: "span 4", height: "auto" }}>
          <div className="magic-bento-card__header">
            <div>
              <span className="magic-bento-card__label">Global Database</span>
              <h2 className="magic-bento-card__title">Roster de Jugadores</h2>
            </div>
            <div className="magic-bento-card__description">
              {filtered.length} Atletas Disponibles
            </div>
          </div>

          <div className="player-table-wrapper">
            {/* TOOLBAR DE BÚSQUEDA */}
            <div className="player-table-toolbar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="BUSCAR ATLETA O ID..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              <select
                value={equipoFiltro}
                onChange={e => { setEquipoFiltro(e.target.value); setPage(1); }}
                style={{
                  background: '#11111a',
                  border: '1px solid var(--border-color)',
                  borderRadius: '30px',
                  color: 'white',
                  padding: '0 20px',
                  height: '50px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <option value="ALL">TODOS LOS EQUIPOS</option>
                {equipos.map(e => <option key={e.id} value={e.nombre}>{e.nombre.toUpperCase()}</option>)}
              </select>
            </div>

            {/* CONTENEDOR CON SCROLL ACTIVADO */}
            <div style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "500px", // Ajusta esta altura según tu necesidad
              paddingRight: "5px",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--purple-primary) transparent"
            }}>
              <style>{`
                div::-webkit-scrollbar { width: 6px; }
                div::-webkit-scrollbar-track { background: transparent; }
                div::-webkit-scrollbar-thumb { 
                  background-color: var(--purple-primary); 
                  border-radius: 10px; 
                  border: 1px solid var(--background-dark);
                }
              `}</style>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--background-dark)", zIndex: 1 }}>
                  <tr>
                    <th>Atleta</th>
                    <th>Posición</th>
                    <th>Club</th>
                    <th style={{ textAlign: 'right' }}>ID Sistema</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((p, i) => (
                      <tr key={p.id || i}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img
                              src={p.imagen_url || "https://via.placeholder.com/40"}
                              style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--purple-primary)' }}
                              alt={p.nombre}
                            />
                            <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{p.nombre}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{p.posicion}</span>
                        </td>
                        <td>{p.equipo}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
                          #{p.id}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                        NO SE ENCONTRARON REGISTROS EN LA RED
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN ADAPTADA */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)'
            }}>
              <button
                className="magic-bento-card__label"
                style={{ cursor: 'pointer', opacity: page === 1 ? 0.3 : 1 }}
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                PREV_SISTEMA
              </button>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                DATA_PAGE: <span style={{ color: 'var(--accent-cyan)' }}>{page}</span> / {totalPages}
              </div>

              <button
                className="magic-bento-card__label"
                style={{ cursor: 'pointer', opacity: page >= totalPages ? 0.3 : 1 }}
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                NEXT_SISTEMA
              </button>
            </div>
          </div>
        </div>

        {/* CARTAS DE APOYO (VISUALES) */}
        <div className="magic-bento-card">
          <div className="magic-bento-card__header">
            <span className="magic-bento-card__label">Stats</span>
          </div>
          <div className="magic-bento-card__content">
            <h3 className="magic-bento-card__title">Métricas de Rendimiento</h3>
            <div className="bento-card__preview">
              <div className="preview-chart-bar" style={{ height: '40%' }}></div>
              <div className="preview-chart-bar" style={{ height: '80%' }}></div>
              <div className="preview-chart-bar" style={{ height: '60%' }}></div>
              <div className="preview-chart-bar" style={{ height: '90%' }}></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Players;