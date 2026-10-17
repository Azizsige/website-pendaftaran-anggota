"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface RegistrationChartProps {
  labels: string[];
  data: number[];
}

export default function RegistrationChart({ labels, data }: RegistrationChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const gradientPrimary = ctx.createLinearGradient(0, 0, 0, 300);
    gradientPrimary.addColorStop(0, "rgba(0, 108, 73, 0.2)");
    gradientPrimary.addColorStop(1, "rgba(0, 108, 73, 0)");

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels.length > 0 ? labels : ["No Data"],
        datasets: [
          {
            label: "New Registrations",
            data: data.length > 0 ? data : [0],
            borderColor: "#006c49",
            backgroundColor: gradientPrimary,
            borderWidth: 2,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#006c49",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#2d3133",
            titleFont: { family: "Geist", size: 14 },
            bodyFont: { family: "Inter", size: 13 },
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { family: "Inter", size: 12 },
              color: "#54647a",
            },
            border: {
                display: false
            }
          },
          y: {
            grid: {
              color: "rgba(108, 122, 113, 0.1)",
            },
            ticks: {
              font: { family: "Inter", size: 12 },
              color: "#54647a",
              stepSize: 20,
            },
            beginAtZero: true,
            border: {
                display: false
            }
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [labels, data]);

  return (
    <div className="flex-1 relative min-h-[300px]">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
