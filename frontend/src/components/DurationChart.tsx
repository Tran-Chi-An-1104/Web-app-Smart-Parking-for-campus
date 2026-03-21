import type { DurationBucket, ParkingSummary } from "../types/parking";
import { durationBarPalette } from "../assets/parkingPalette";

interface DurationChartProps {
  summary: ParkingSummary;
}

const items: {
  key: DurationBucket;
  lines: string[];
}[] = [
  { key: "available", lines: ["available"] },
  { key: "< 5 min", lines: ["< 5 min"] },
  { key: "5 min - 15 min", lines: ["5 min", "- 15 min"] },
  { key: "15 min - 1 hour", lines: ["15 min", "- 1 hour"] },
  { key: "1 hour - 3 hours", lines: ["1 hour", "- 3 hours"] },
  { key: "> 3 hours", lines: ["> 3 hours"] },
];

export function DurationChart({ summary }: DurationChartProps) {
  const max = Math.max(...items.map((item) => summary.byDuration[item.key]), 1);

  return (
    <div className="chart-area">
      <div className="chart-bars">
        {items.map((item, index) => {
          const value = summary.byDuration[item.key];
          const height = value === 0 ? 8 : Math.max((value / max) * 170, 18);

          return (
            <div className="bar-column" key={item.key}>
              <div className="bar-value">{value}</div>

              <div
                className="bar"
                style={{
                  height: `${height}px`,
                  background: durationBarPalette[index],
                }}
              />

              <div className="bar-label">
                {item.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}