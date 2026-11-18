"use client";

import { useEffect, useRef } from "react";
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useTheme } from "@/components/providers/ThemeProvider";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
);

interface RegistrationChartProps {
  labels: string[];
  data: number[];
}

export default function RegistrationChart({
  labels,
  data,
}: RegistrationChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const hasAnyValue = data.some((val) => val > 0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const lineColor = isDark ? "#34d399" : "#006c49";
    const gradientPrimary = ctx.createLinearGradient(0, 0, 0, 280);
    gradientPrimary.addColorStop(0, isDark ? "rgba(52, 211, 153, 0.24)" : "rgba(0, 108, 73, 0.18)");
    gradientPrimary.addColorStop(1, isDark ? "rgba(52, 211, 153, 0.01)" : "rgba(0, 108, 73, 0.01)");

    const safeLabels = labels.length > 0 ? labels : ["Belum ada data"];
    const safeData = data.length > 0 ? data : [0];
    const pointRadius = safeLabels.length > 15 ? 2 : 4;

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: safeLabels,
        datasets: [
          {
            label: "Pendaftar Masuk",
            data: safeData,
            borderColor: lineColor,
            backgroundColor: gradientPrimary,
            borderWidth: 2.5,
            pointBackgroundColor: isDark ? "#131d1a" : "#ffffff",
            pointBorderColor: lineColor,
            pointBorderWidth: 2,
            pointRadius,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.36,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: isDark ? "#1a2723" : "#191c1e",
            titleColor: "#eef2f4",
            bodyColor: "#eef2f4",
            borderColor: isDark ? "#3c4d46" : "transparent",
            borderWidth: isDark ? 1 : 0,
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label(context) {
                const value = context.parsed.y ?? 0;
                return `${value} pendaftar`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 4,
            grid: {
              color: isDark ? "#24332d" : "#eef2f6",
            },
            border: {
              display: false,
            },
            ticks: {
              precision: 0,
              color: isDark ? "#94a89e" : "#52606d",
              font: {
                size: 11,
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: isDark ? "#94a89e" : "#52606d",
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
              font: {
                size: 11,
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [labels, data, isDark]);

  return (
    <div className="h-[280px] sm:h-[300px] w-full relative">
      <canvas
        ref={canvasRef}
        aria-label="Grafik tren pendaftar masuk organisasi"
      />
      {!hasAnyValue && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="px-3.5 py-2 rounded-lg bg-white/95 dark:bg-[#1a2723]/95 border border-[#e2e8f0] dark:border-[#3c4d46] text-xs font-medium text-[#52606d] dark:text-[#cbd6d0]">
            Belum ada pendaftaran tercatat pada rentang grafik ini
          </span>
        </div>
      )}
    </div>
  );
}
