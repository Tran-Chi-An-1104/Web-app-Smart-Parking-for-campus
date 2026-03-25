import type { FilterState } from "../types/parking";

export const sectorOptions = [
  "All Zones",
  "Zone A",
  "Zone B",
  "Zone C",
  "Zone D",
  "Car Zone",
];

export const durationOptions = [
  "All durations",
  "available",
  "< 5 min",
  "5 min - 15 min",
  "15 min - 1 hour",
  "1 hour - 3 hours",
  "> 3 hours",
];

export const defaultFilters: FilterState = {
  sector: "All Zones",
  duration: "All durations",
};