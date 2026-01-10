import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

export default function MiniChart({ title, value, labels, data, suffix }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, "rgba(33, 150, 243, 0.3)");
    gradient.addColorStop(1, "rgba(33, 150, 243, 0)");

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data,
            borderColor: "#1E88E5",
            borderWidth: 2,
            fill: true,
            backgroundColor: gradient,
            tension: 0.4,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: {
            ticks: {
              color: "#777",
              font: { size: 14 }
            },
            grid: { display: false }
          },
          y: {
            display: false
          }
        }
      }
    });

    return () => chart.destroy();
  }, []);

  return (
    <div className="mini-chart">
      <h3 className="mini-chart-title">{title}</h3>

      <div className="mini-chart-value">
        {value} {suffix || ""}
      </div>

      <div className="mini-chart-canvas">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}
