export default function JugadoresTable({ data, jugadores }) {
  if (!data || !jugadores) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Jugador</th>
            <th className="p-2 text-center">Eventos</th>
            <th className="p-2 text-center">Tipos de evento</th>
            <th className="p-2 text-center">xG</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(data).map(([jugadorId, kpis]) => {
            const jugador = jugadores.find(
              (j) => j.id === Number(jugadorId)
            );

            return (
              <tr key={jugadorId} className="border-t">
                {/* JUGADOR */}
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    {jugador?.imagen_url && (
                      <img
                        src={jugador.imagen_url}
                        alt={jugador.nombre}
                        className="h-8 w-8 rounded-full object-cover border"
                        onError={(e) => {
                          e.target.src = "/default-player.png";
                        }}
                      />
                    )}
                    <span className="font-medium">
                      {jugador?.nombre || `Jugador ${jugadorId}`}
                    </span>
                  </div>
                </td>

                {/* EVENTOS TOTAL */}
                <td className="p-2 text-center font-semibold">
                  {kpis.eventos_total}
                </td>

                {/* EVENTOS POR TIPO */}
                <td className="p-2 text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    {kpis.eventos_por_tipo &&
                      Object.entries(kpis.eventos_por_tipo).map(
                        ([tipo, cantidad]) => (
                          <span
                            key={tipo}
                            className="px-2 py-1 text-xs rounded bg-gray-200"
                          >
                            {tipo}: {cantidad}
                          </span>
                        )
                      )}
                  </div>
                </td>

                {/* XG */}
                <td className="p-2 text-center">
                  {kpis.xg?.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
