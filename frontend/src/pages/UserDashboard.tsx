import { useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { ParkingMap } from "../components/ParkingMap";
import { userParkingSlots } from "../services/parkingService";

interface UserDashboardProps {
  onViewChange: (view: "admin" | "user") => void;
  onSignOut: () => void;
}

export default function UserDashboard({ onViewChange, onSignOut }: UserDashboardProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const selectedSlot =
    userParkingSlots.find((slot) => slot.id === selectedSlotId) ?? null;

  return (
    <div className="app-shell">
      <div className="page-shell">
        <FilterBar viewMode="user" onViewChange={onViewChange} onSignOut={onSignOut} />

        <main className="page-content" aria-labelledby="user-page-title">
          <header className="page-header">
            <h1 id="user-page-title" className="page-title">
              Campus Parking Availability Map
            </h1>
            <p className="page-subtitle">
              See which parking slots are currently available or occupied before
              entering the parking area.
            </p>
          </header>

          <div className="user-map-grid">
            <ParkingMap
              mode="user"
              slots={userParkingSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlotId}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
