import { useMemo, useState } from "react";
import { defaultFilters } from "../store/dashboardStore";
import {
  createSummary,
  filterSlots,
  parkingSlots,
} from "../services/parkingService";

export function useParkingDashboard() {
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const visibleSlots = useMemo(() => {
    return filterSlots(parkingSlots, filters.sector, filters.duration);
  }, [filters]);

  const summary = useMemo(() => createSummary(visibleSlots), [visibleSlots]);

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
