import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

export default function ProgressivePassesMagic({ initialData }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // 1. Validaciones de datos
    if (!initialData || !Array.isArray(initialData) || initialData.length === 0) return;

    // 2. Inicialización de la instancia
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    /* ===============================
       PROCESAMIENTO DE DATOS
    =============================== */
    const progressiveEvents = initialData.filter(ev => {
      const x1 = Number(ev.x);
      const x2 = Number(ev.x2);
      // Definición de progresivo: avance de al menos 5 unidades
      return !isNaN(x1) && !isNaN(x2) && (x2 - x1) >= 5;
    });

    const playerMap = {};
    progressiveEvents.forEach(ev => {
      const name = ev.jugador || "Desconocido";
      playerMap[name] = (playerMap[name] || 0) + 1;
    });

    // Ordenar para el Top 12 (Barras) y Top 7 (Pie)
    const sorted = Object.entries(playerMap).sort((a, b) => b[1] - a[1]);
    const topBars = sorted.slice(0, 12).reverse(); // .reverse() porque el eje Y de ECharts se dibuja de abajo hacia arriba

    /* ===============================
       CONFIGURACIÓN DE ECHARTS
    =============================== */
    const option = {
      backgroundColor: "transparent",

      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" }
      },

      title: [
        {
          text: "Análisis de Progresión",
          subtext: `Total: ${progressiveEvents.length} pases detectados`,
          left: "0%", // Pegado a la izquierda
          top: 10,
          textStyle: { color: "#fff", fontSize: 22 },
          subtextStyle: { color: "#94a3b8" }
        },
        {
          text: "Distribución de Carga",
          left: "0%", // Pegado a la izquierda
          top: "62%",
          textStyle: { color: "#fff", fontSize: 18 }
        }
      ],

      // Ajuste de la cuadrícula para maximizar espacio a la izquierda
      grid: {
        left: "0%",      // Eliminamos margen inicial
        right: "10%",    // Espacio para que las etiquetas de la derecha no se corten
        top: "15%",
        bottom: "40%",
        containLabel: true // Obligatorio para que los nombres de jugadores sean visibles
      },

      xAxis: {
        type: "value",
        axisLabel: { color: "#94a3b8" },
        splitLine: {
          lineStyle: { color: "#334155", type: "dashed" }
        }
      },

      yAxis: {
        type: "category",
        data: topBars.map(d => d[0]),
        axisLabel: {
          color: "#fff",
          fontSize: 13,
          margin: 12 // Espacio entre el nombre y el eje
        },
        axisLine: { lineStyle: { color: "#334155" } }
      },

      series: [
        {
          name: "Pases Progresivos",
          type: "bar",
          data: topBars.map(d => d[1]),
          barWidth: "60%",
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: "#6366f1" },
              { offset: 1, color: "#a855f7" }
            ])
          },
          label: {
            show: true,
            position: "right",
            color: "#fff",
            fontWeight: "bold"
          }
        },
        {
          type: "pie",
          radius: ["8%", "18%"],
          center: ["30%", "82%"],
          avoidLabelOverlap: true,
          data: sorted.slice(0, 7).map(d => ({
            name: d[0],
            value: d[1]
          })),
          itemStyle: {
            borderRadius: 6,
            borderWidth: 2,
            borderColor: "#0f172a" // Ajustado al fondo oscuro típico de dashboards
          },
          label: {
            color: "#e5e7eb",
            formatter: "{b}: {c}"
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    chartInstance.current.setOption(option, true);

    // Manejo de redimensionamiento
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      // Opcional: limpiar instancia al desmontar
      // chartInstance.current?.dispose();
    };
  }, [initialData]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "900px",
        minWidth: "600px" // Evita que en móviles se colapse demasiado
      }}
    />
  );
}