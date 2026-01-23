import React, { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GridComponent
} from "echarts/components";
import { PieChart } from "echarts/charts";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GridComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout
]);

export default function CombinedPassesCharts({ initialData }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  let pasesC = 0, pasesI = 0;
  let filtradosC = 0, filtradosI = 0;
  let duelosG = 0, duelosP = 0;

  if (Array.isArray(initialData)) {
    initialData.forEach(e => {
      const t = e.event
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (t === "pase completo") pasesC++;
      if (t === "pase incompleto") pasesI++;
      if (t === "pase filtrado") filtradosC++;
      if (t === "balon aereo ganado") duelosG++;
      if (t === "balon aereo perdido") duelosP++;
    });
  }

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    const commonSeriesSettings = {
      type: "pie",
      radius: ["22%", "34%"], // 🔥 FIX REAL
      label: { show: false },
      itemStyle: {
        borderRadius: 8,
        borderColor: "#020617",
        borderWidth: 2
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 26,
          fontWeight: "bold",
          color: "#fff",
          formatter: "{d}%"
        }
      }
    };

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        textStyle: { color: "#fff" },
        borderColor: "#334155"
      },
      title: [
        {
          text: "Pases Totales",
          left: "center",
          top: "1%",          // ⬅️ antes 2%
          textStyle: { color: "#e5e7eb", fontSize: 16 }
        },
        {
          text: "Pases Filtrados",
          left: "center",
          top: "33%",         // ⬅️ antes 36%
          textStyle: { color: "#e5e7eb", fontSize: 16 }
        },
        {
          text: "Duelos Aéreos",
          left: "center",
          top: "64%",         // ⬅️ antes 70%
          textStyle: { color: "#e5e7eb", fontSize: 16 }
        }
      ],

      color: ["#7c3aed", "#38bdf8"],
      series: [
        {
          ...commonSeriesSettings,
          center: ["50%", "18%"],
          data: [
            { value: pasesC, name: "Completados" },
            { value: pasesI, name: "Perdidos" }
          ]
        },
        {
          ...commonSeriesSettings,
          center: ["50%", "50%"],
          data: [
            { value: filtradosC, name: "Pases filtrados" },
            { value: filtradosI, name: "—" }
          ]
        },
        {
          ...commonSeriesSettings,
          center: ["50%", "82%"],
          data: [
            { value: duelosG, name: "Ganados" },
            { value: duelosP, name: "Perdidos" }
          ]
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      chartInstance.current = null;
    };
  }, [initialData]);

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <div
        ref={chartRef}
        style={{
          width: "100%",
          maxWidth: "600px",
          height: "750px"
        }}
      />
    </div>
  );
}
