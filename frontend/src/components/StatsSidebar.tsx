import type { ParkingSummary } from "../types/parking";
import { DurationChart } from "./DurationChart";
import { OccupancyGauge } from "./OccupancyGauge";
import { formatDurationCompact } from "../services/parkingService";

interface StatsSidebarProps {
  summary: ParkingSummary;
}

export function StatsSidebar({ summary }: StatsSidebarProps) {
  return (
    <aside className="stats-sidebar">
      <section className="panel stat-panel">
        <div className="panel-title-row">
          <h3>Occupancy</h3>
          <span className="info-badge">i</span>
        </div>
        <OccupancyGauge summary={summary} />
      </section>

      <section className="panel stat-panel">
        <div className="panel-title-row">
          <h3>Median visit duration</h3>
          <span className="info-badge">i</span>
        </div>
        <div className="median-value">
          {formatDurationCompact(summary.medianVisitMinutes)}
        </div>
      </section>

      <section className="panel stat-panel">
        <div className="panel-title-row">
          <h3>Parking duration</h3>
          <span className="info-badge">i</span>
        </div>
        <DurationChart summary={summary} />
      </section>

      <section className="panel stat-panel">
        <div className="panel-title-row">
          <h3>Zone status</h3>
          <span className="info-badge">i</span>
        </div>

        <div className="sector-list">
          {summary.bySector.map((item) => (
            <div key={item.sector} className="sector-row">
              <span className="sector-name">{item.sector}</span>
              <span className="status-pill available">
                {item.available} free
              </span>
              <span className="status-pill occupied">
                {item.occupied} parked
              </span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}