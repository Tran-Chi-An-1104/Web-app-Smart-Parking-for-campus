import { forwardRef } from "react";
import type { ParkingSlot } from "../types/parking";
import { formatDurationFull } from "../services/parkingService";

interface SlotDetailCardProps {
  slot: ParkingSlot;
}

export const SlotDetailCard = forwardRef<HTMLDivElement, SlotDetailCardProps>(
  function SlotDetailCard({ slot }, ref) {
    return (
      <div ref={ref} className="slot-detail-card">
        <h4>{slot.code}</h4>

        <div className="slot-detail-row">
          <span>status</span>
          <strong className={`slot-pill ${slot.status}`}>{slot.status}</strong>
        </div>

        <div className="slot-detail-row">
          <span>duration</span>
          <strong>
            {slot.status === "available"
              ? "ready now"
              : formatDurationFull(slot.durationMinutes)}
          </strong>
        </div>

        <div className="slot-detail-row">
          <span>since</span>
          <strong>{slot.since}</strong>
        </div>

        <div className="slot-detail-row">
          <span>sector</span>
          <strong>{slot.sector}</strong>
        </div>
      </div>
    );
  }
);
