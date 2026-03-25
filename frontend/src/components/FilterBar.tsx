import { durationOptions, sectorOptions } from "../store/dashboardStore";

interface FilterBarProps {
  sector: string;
  duration: string;
  onSectorChange: (value: string) => void;
  onDurationChange: (value: string) => void;
}

export function FilterBar({
  sector,
  duration,
  onSectorChange,
  onDurationChange,
}: FilterBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">●</span>
        <span>Smart traffic dashboard</span>
      </div>

      <div className="topbar-actions">
        <label className="filter-chip">
          <span>Zone</span>
          <select
            value={sector}
            onChange={(event) => onSectorChange(event.target.value)}
          >
            {sectorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-chip">
          <span>Duration</span>
          <select
            value={duration}
            onChange={(event) => onDurationChange(event.target.value)}
          >
            {durationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="version-pill">version 1.0</div>
      </div>
    </header>
  );
}