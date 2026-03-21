import { useEffect, useMemo, useState } from "react";
import { defaultFilters } from "../store/dashboardStore";
import {
  createParkingSlots,
  createSummary,
  filterSlots,
} from "../services/parkingService";

export function useParkingDashboard() {
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const allSlots = useMemo(() => {
    return createParkingSlots().map((slot, index) => ({
      ...slot,
      code: String(index + 1),
    }));
  }, []);

  const visibleSlots = useMemo(() => {
    return filterSlots(allSlots, filters.sector, filters.duration);
  }, [allSlots, filters]);

  const summary = useMemo(() => createSummary(visibleSlots), [visibleSlots]);

  useEffect(() => {
    if (selectedSlotId && !visibleSlots.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId(null);
    }
  }, [visibleSlots, selectedSlotId]);

  const selectedSlot =
    visibleSlots.find((slot) => slot.id === selectedSlotId) ?? null;

  return {
    filters,
    setFilters,
    slots: visibleSlots,
    summary,
    selectedSlot,
    setSelectedSlotId,
  };
}