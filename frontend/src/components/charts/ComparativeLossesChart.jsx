import { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';

/**
 * ===========================
 * NORMALIZADOR SEGURO
 * ===========================
 */
const normalize = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * ===========================
 * MATCHERS DE EVENTOS
 * ===========================
 */
const isLossEvent = (event) => {
  const e = normalize(event);
  return (
    e.includes('incompleto') ||
    e.includes('perdido') ||
    e.includes('perdida') ||
    e.includes('control fallido')
  );
};

const isWinEvent = (event) => {
  const e = normalize(event);
  return (
    (e.includes('completo') && !e.includes('incompleto')) ||
    e.includes('ganado') ||
    e.includes('ganada') ||
    e.includes('exitoso') ||
    e.includes('filtrado') ||
    (e.includes('entre lineas') && !e.includes('incompleto')) ||
    e.includes('recuperacion') ||
    e.includes('intercepcion')
  );
};

/**
 * ===========================
 * COMPONENTE PRINCIPAL
 * ===========================
 */
export default function ComparativeLossesAndWinsChart({ initialData }) {
  const lossesRef = useRef(null);
  const winsRef = useRef(null);
  const lossesChart = useRef(null);
  const winsChart = useRef(null);

  /**
   * PROCESAMIENTO DE DATOS
   */
  const { players, losses, wins } = useMemo(() => {
    const lossesByPlayer = {};
    const winsByPlayer = {};

    if (Array.isArray(initialData)) {
      initialData.forEach(row => {
        const eventRaw = row.Event || row.event || row.Evento || row.tipo_evento;
        const playerRaw = row.Player || row.player || row.jugador || row.player_name || 'Desconocido';

        if (isLossEvent(eventRaw)) {
          lossesByPlayer[playerRaw] = (lossesByPlayer[playerRaw] || 0) + 1;
        } else if (isWinEvent(eventRaw)) {
          winsByPlayer[playerRaw] = (winsByPlayer[playerRaw] || 0) + 1;
        }
      });
    }

    const allPlayers = Array.from(new Set([...Object.keys(lossesByPlayer), ...Object.keys(winsByPlayer)]));
    allPlayers.sort((a, b) => a.localeCompare(b));

    return {
      players: allPlayers,
      losses: allPlayers.map(p => lossesByPlayer[p] || 0),
      wins: allPlayers.map(p => winsByPlayer[p] || 0)
    };
  }, [initialData]);

  /**
   * EFECTO ECHARTS
   */
  useEffect(() => {
    if (!players.length) return;

    const getCommonOption = (title, color1, color2, data) => ({
      backgroundColor: 'transparent',
      title: { 
        text: title, 
        left: 'center', 
        textStyle: { color: '#e5e7eb', fontSize: 14, fontWeight: '600' } 
      },
      tooltip: { 
        trigger: 'axis', 
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: '#334155',
        textStyle: { color: '#fff' }
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'filter',
          start: 0,
          end: players.length > 8 ? (8 / players.length) * 100 : 100
        },
        {
          type: 'slider',
          show: true,
          xAxisIndex: 0,
          bottom: 10,
          height: 12,
          borderColor: 'transparent',
          fillerColor: 'rgba(255, 255, 255, 0.1)',
          handleStyle: { color: color1 },
          textStyle: { color: 'transparent' },
          brushSelect: false
        }
      ],
      grid: { left: '5%', right: '5%', top: 60, bottom: 80, containLabel: true },
      xAxis: {
        type: 'category',
        data: players,
        axisLabel: { rotate: 45, color: '#cbd5f5', fontSize: 10, interval: 0 },
        axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisTick: { show: false }
      },
      yAxis: { 
        type: 'value', 
        axisLabel: { color: '#94a3b8' }, 
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } 
      },
      series: [{
        type: 'bar',
        data: data,
        barWidth: '45%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color1 },
            { offset: 1, color: color2 }
          ])
        }
      }]
    });

    // Función para inicializar y redimensionar
    const renderCharts = () => {
      if (lossesRef.current) {
        if (!lossesChart.current) lossesChart.current = echarts.init(lossesRef.current);
        lossesChart.current.setOption(getCommonOption('PÉRDIDAS POR JUGADOR', '#ef4444', '#7f1d1d', losses));
        lossesChart.current.resize();
      }
      if (winsRef.current) {
        if (!winsChart.current) winsChart.current = echarts.init(winsRef.current);
        winsChart.current.setOption(getCommonOption('ACCIONES GANADAS POR JUGADOR', '#22c55e', '#166534', wins));
        winsChart.current.resize();
      }
    };

    // Delay crucial para esperar la expansión del contenedor Bento
    const timeout = setTimeout(renderCharts, 350);

    const resizeObserver = new ResizeObserver(() => {
      lossesChart.current?.resize();
      winsChart.current?.resize();
    });

    if (lossesRef.current) resizeObserver.observe(lossesRef.current);
    if (winsRef.current) resizeObserver.observe(winsRef.current);

    const handleResize = () => {
      lossesChart.current?.resize();
      winsChart.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      lossesChart.current?.dispose();
      winsChart.current?.dispose();
      lossesChart.current = null;
      winsChart.current = null;
    };
  }, [players, losses, wins]);

  if (!players.length) return (
    <div className="w-full text-center p-10 text-gray-400">
      Esperando datos de jugadores...
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center justify-center gap-12 py-4">
      {/* Gráfica de Pérdidas */}
      <div className="w-full max-w-[950px]">
        <div ref={lossesRef} style={{ width: '100%', height: '400px' }} />
      </div>

      {/* Gráfica de Ganadas */}
      <div className="w-full max-w-[950px]">
        <div ref={winsRef} style={{ width: '100%', height: '400px' }} />
      </div>
    </div>
  );
}