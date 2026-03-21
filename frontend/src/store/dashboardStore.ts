import type { FilterState } from "../types/parking";

export const sectorOptions = [
  "All sectors",
  "Sector 1",
  "Sector 2",
  "Sector 3",
  "Sector 4",
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
  sector: "All sectors",
  duration: "All durations",
};