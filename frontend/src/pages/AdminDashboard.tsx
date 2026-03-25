import { lazy, Suspense } from "react";
import { FilterBar } from "../components/FilterBar";
import { ParkingMap } from "../components/ParkingMap";
import { useParkingDashboard } from "../hooks/useParkingDashboard";

const StatsSidebar = lazy(() =>
  import("../components/StatsSidebar").then((module) => ({
    default: module.StatsSidebar,
  }))
);

interface AdminDashboardProps {
  onSignOut: () => void;
  onViewChange: (view: "admin" | "user") => void;
}

export default function AdminDashboard({
  onSignOut,
  onViewChange,
}: AdminDashboardProps) {
  const {
    filters,
    setFilters,
    slots,
    summary,
    selectedSlot,
    setSelectedSlotId,
  } = useParkingDashboard();

  return (
    <div className="app-shell">
      <div className="page-shell">
        <FilterBar
          viewMode="admin"
          sector={filters.sector}
          duration={filters.duration}
          onSignOut={onSignOut}
          onViewChange={onViewChange}
          onSectorChange={(value) =>
            setFilters((prev) => ({ ...prev, sector: value }))
          }
          onDurationChange={(value) =>
            setFilters((prev) => ({ ...prev, duration: value }))
          }
        />

        <main className="page-content" aria-labelledby="page-title">
          <header className="page-header">
            <h1 id="page-title" className="page-title">
              Campus Smart Parking Dashboard
            </h1>
            <p className="page-subtitle">
              Monitor live parking occupancy, compare zone availability, and
              inspect parking duration trends from one interactive campus map.
            </p>
          </header>

          <div className="dashboard-grid">
            <ParkingMap
              mode="admin"
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={(id) => setSelectedSlotId(id)}
            />
            <Suspense
              fallback={
                <aside className="stats-sidebar" aria-hidden="true">
                  <section className="panel stat-panel stat-panel-loading" />
                  <section className="panel stat-panel stat-panel-loading" />
                  <section className="panel stat-panel stat-panel-loading" />
                  <section className="panel stat-panel stat-panel-loading" />
                </aside>
              }
            >
              <StatsSidebar summary={summary} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
