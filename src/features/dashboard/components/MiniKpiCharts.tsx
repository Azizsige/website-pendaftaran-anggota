"use client";

import { useId } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface SeriesProps {
  values: number[];
  labels: string[];
  ariaLabel: string;
}

function normalizeSeries(values: number[]): number[] {
  if (!values.length) return [0, 0, 0, 0, 0, 0, 0];
  return values;
}

export function TrackBarsMiniChart({
  values,
  labels,
  ariaLabel,
  accentColor = "#006c49",
  trackColor = "#e6f4ee",
}: SeriesProps & { accentColor?: string; trackColor?: string }) {
  const safeValues = normalizeSeries(values);
  const maxVal = Math.max(1, ...safeValues);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="h-[74px] w-full flex items-end justify-between gap-2 pt-2"
    >
      {safeValues.map((value, index) => {
        const ratio = value / maxVal;
        const heightPct = value > 0 ? Math.max(18, Math.round(ratio * 100)) : 8;
        const dayLabel = labels[index] ? `${labels[index]}: ` : "";
        return (
          <div
            key={`${dayLabel}${index}`}
            title={`${dayLabel}${value}`}
            className="flex-1 h-full flex items-end justify-center"
          >
            <div
              className="w-3.5 sm:w-4 h-full rounded-full flex items-end justify-center p-[2px]"
              style={{ backgroundColor: trackColor }}
            >
              <div
                className="w-full rounded-full transition-[height] duration-300"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: accentColor,
                  opacity: value > 0 ? 1 : 0.25,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function buildSmoothPath(
  points: { x: number; y: number }[]
): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;
    path += ` C ${midX.toFixed(1)} ${curr.y.toFixed(1)}, ${midX.toFixed(1)} ${next.y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }
  return path;
}

function mapSeriesToPoints(
  values: number[],
  width: number,
  topPad: number,
  bottomY: number
): { x: number; y: number }[] {
  const safeValues = normalizeSeries(values);
  const maxVal = Math.max(1, ...safeValues);
  const spanY = bottomY - topPad;
  const count = safeValues.length;
  return safeValues.map((val, idx) => {
    const x = count === 1 ? width / 2 : (idx / (count - 1)) * width;
    const ratio = val / maxVal;
    const y = bottomY - ratio * spanY;
    return { x, y };
  });
}

export function DualSparklineMiniChart({
  primaryValues,
  secondaryValues,
  ariaLabel,
}: {
  primaryValues: number[];
  secondaryValues: number[];
  ariaLabel: string;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const gradId = useId().replace(/:/g, "");
  const width = 220;
  const primaryColor = isDark ? "#34d399" : "#006c49";
  const secondaryColor = isDark ? "#fbbf24" : "#d97706";

  const topPoints = mapSeriesToPoints(primaryValues, width, 4, 28);
  const topLine = buildSmoothPath(topPoints);
  const topArea = `${topLine} L ${width} 32 L 0 32 Z`;

  const bottomPoints = mapSeriesToPoints(secondaryValues, width, 40, 64);
  const bottomLine = buildSmoothPath(bottomPoints);

  return (
    <div role="img" aria-label={ariaLabel} className="h-[74px] w-full pt-1">
      <svg
        viewBox={`0 0 ${width} 70`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={`top-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={topArea} fill={`url(#top-${gradId})`} />
        <path
          d={topLine}
          fill="none"
          stroke={primaryColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d={bottomLine}
          fill="none"
          stroke={secondaryColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 3"
        />
      </svg>
    </div>
  );
}

export function ColumnBarsMiniChart({
  values,
  labels,
  ariaLabel,
}: SeriesProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const safeValues = normalizeSeries(values);
  const maxVal = Math.max(1, ...safeValues);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="h-[74px] w-full flex items-end justify-between gap-2 pt-3"
    >
      {safeValues.map((value, index) => {
        const ratio = value / maxVal;
        const heightPct = value > 0 ? Math.max(20, Math.round(ratio * 100)) : 8;
        const dayLabel = labels[index] ? `${labels[index]}: ` : "";
        const isLast = index === safeValues.length - 1;
        return (
          <div
            key={`${dayLabel}${index}`}
            title={`${dayLabel}${value}`}
            className="flex-1 h-full flex items-end"
          >
            <div
              className="w-full rounded-t-md transition-[height] duration-300"
              style={{
                height: `${heightPct}%`,
                backgroundColor:
                  value === 0
                    ? (isDark ? "#24332d" : "#e2e8f0")
                    : isLast
                      ? (isDark ? "#fbbf24" : "#d97706")
                      : "#f59e0b",
                opacity: value === 0 ? 0.85 : isLast ? 1 : 0.72,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function AreaSparklineMiniChart({
  values,
  ariaLabel,
}: Omit<SeriesProps, "labels">) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const gradId = useId().replace(/:/g, "");
  const width = 220;
  const height = 70;
  const lineColor = isDark ? "#34d399" : "#006c49";
  const points = mapSeriesToPoints(values, width, 8, height - 6);
  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div role="img" aria-label={ariaLabel} className="h-[74px] w-full pt-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={`area-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#area-${gradId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.25"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
