import { forwardRef } from "react";
import type { ParkingSlot } from "../types/parking";

interface UserSlotDetailCardProps {
  slot: ParkingSlot;
}

export const UserSlotDetailCard = forwardRef<
  HTMLDivElement,
  UserSlotDetailCardProps
>(function UserSlotDetailCard({ slot }, ref) {
  return (
    <div ref={ref} className="slot-detail-card">
      <h4>Slot {slot.code}</h4>

      <div className="slot-detail-row">
        <span>status</span>
        <strong className={`slot-pill ${slot.status}`}>{slot.status}</strong>
      </div>

      <div className="slot-detail-row">
        <span>zone</span>
        <strong>{slot.sector}</strong>
      </div>

      <div className="slot-detail-row">
        <span>block</span>
        <strong>{slot.block}</strong>
      </div>
    </div>
  );
});
