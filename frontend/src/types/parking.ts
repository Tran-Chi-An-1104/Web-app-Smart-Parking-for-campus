export type SlotStatus = "available" | "occupied";

export type MarkerColor = "green" | "yellow" | "orange" | "red";

export type DurationBucket =
  | "available"
  | "< 5 min"
  | "5 min - 15 min"
  | "15 min - 1 hour"
  | "1 hour - 3 hours"
  | "> 3 hours";

export interface ParkingSlot {
  id: string;
  code: string;
  sector: string;
  block: string;
  status: SlotStatus;
  durationMinutes: number;
  since: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  marker: MarkerColor;
}

export interface FilterState {
  sector: string;
  duration: string;
}

export interface ParkingSummary {
  total: number;
  available: number;
  occupied: number;
  occupancyRate: number;
  medianVisitMinutes: number;
  byDuration: Record<DurationBucket, number>;
  bySector: Array<{
    sector: string;
    total: number;
    available: number;
    occupied: number;
  }>;
}