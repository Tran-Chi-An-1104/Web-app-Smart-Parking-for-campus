import { useEffect, useRef, useState } from "react";
import { durationOptions, sectorOptions } from "../store/dashboardStore";

type ViewMode = "admin" | "user";

type AdminFilterBarProps = {
  viewMode: "admin";
  sector: string;
  duration: string;
  onSignOut: () => void;
  onViewChange: (view: ViewMode) => void;
  onSectorChange: (value: string) => void;
  onDurationChange: (value: string) => void;
};

type UserFilterBarProps = {
  viewMode: "user";
  onViewChange: (view: ViewMode) => void;
  onSignOut: () => void;
};

type FilterBarProps = AdminFilterBarProps | UserFilterBarProps;

export function FilterBar(props: FilterBarProps) {
  const isAdminView = props.viewMode === "admin";
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAdminView || !isSettingsOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isAdminView, isSettingsOpen]);

  return (
    <header className="topbar">
      <div className="brand">
        <span>Smart Parking Dashboard</span>
      </div>

      <div className="topbar-actions">
        <div className="view-switcher" aria-label="Dashboard mode">
          <button
            className={`view-button ${isAdminView ? "is-active" : ""}`}
            type="button"
            aria-pressed={isAdminView}
            onClick={() => props.onViewChange("admin")}
          >
            Admin view
          </button>
          <button
            className={`view-button ${!isAdminView ? "is-active" : ""}`}
            type="button"
            aria-pressed={!isAdminView}
            onClick={() => props.onViewChange("user")}
          >
            User view
          </button>
        </div>

        {isAdminView ? (
          <>
            <label className="filter-chip">
              <span>Zone</span>
              <select
                value={props.sector}
                onChange={(event) => props.onSectorChange(event.target.value)}
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
                value={props.duration}
                onChange={(event) => props.onDurationChange(event.target.value)}
              >
                {durationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        <div className="version-pill">version 1.0</div>

        {!isAdminView ? (
          <button className="signout-button" type="button" onClick={props.onSignOut}>
            Sign out
          </button>
        ) : null}

        {isAdminView ? (
          <div className="settings-menu" ref={settingsRef}>
            <button
              className="settings-button"
              type="button"
              aria-haspopup="menu"
              aria-expanded={isSettingsOpen}
              onClick={() => setIsSettingsOpen((current) => !current)}
            >
              Settings
            </button>

            {isSettingsOpen ? (
              <div className="settings-dropdown" role="menu" aria-label="Settings">
                <button
                  className="settings-dropdown__item"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    props.onSignOut();
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
