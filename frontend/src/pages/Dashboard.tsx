import { FilterBar } from "../components/FilterBar";
import { ParkingMap } from "../components/ParkingMap";
import { SideNav } from "../components/SideNav";
import { StatsSidebar } from "../components/StatsSidebar";
import { useParkingDashboard } from "../hooks/useParkingDashboard";

export default function Dashboard() {
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
      <SideNav />

      <div className="page-shell">
        <FilterBar
          sector={filters.sector}
          duration={filters.duration}
          onSectorChange={(value) =>
            setFilters((prev) => ({ ...prev, sector: value }))
          }
          onDurationChange={(value) =>
            setFilters((prev) => ({ ...prev, duration: value }))
          }
        />

        <main className="page-content">
          <div className="page-title">Parking</div>

          <div className="dashboard-grid">
            <ParkingMap
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={(id) => setSelectedSlotId(id)}
            />
            <StatsSidebar summary={summary} />
          </div>
        </main>
      </div>
    </div>
  );
}