import type { CSSProperties } from "react";
import type { ParkingSummary } from "../types/parking";

interface OccupancyGaugeProps {
  summary: ParkingSummary;
}

export function OccupancyGauge({ summary }: OccupancyGaugeProps) {
  const gaugeAngle = `${(summary.occupied / Math.max(summary.total, 1)) * 180}deg`;
  const gaugeStyle = {
    "--gauge-angle": gaugeAngle,
  } as CSSProperties;

  return (
    <div className="occupancy-layout">
      <div className="gauge-wrap" style={gaugeStyle}>
        <div className="gauge-half">
          <div className="gauge-ring" />
        </div>
      </div>

      <div className="occupancy-metrics">
        <div className="metric-line">
          <strong>{summary.available}</strong>
          <span>available</span>
        </div>
        <div className="metric-line">
          <strong>{summary.occupied}</strong>
          <span>occupied</span>
        </div>
        <div className="metric-line">
          <strong>{summary.total}</strong>
          <span>total</span>
        </div>
      </div>
    </div>
  );
}
