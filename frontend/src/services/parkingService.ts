import type {
  DurationBucket,
  MarkerColor,
  ParkingSlot,
  ParkingSummary,
} from "../types/parking";

type ClusterConfig = {
  block: string;
  sector: string;
  startX: number;
  startY: number;
  columns: number;
  rows: number;
  slotWidth: number;
  slotHeight: number;
  gapX: number;
  gapY: number;
  codeStart: number;
};

// 120 slot xe máy hiện tại + 40 slot ô tô mới ở phía dưới
const clusterConfigs: ClusterConfig[] = [
  {
    block: "A",
    sector: "Zone A",
    startX: 180,
    startY: 120,
    columns: 2,
    rows: 15,
    slotWidth: 36,
    slotHeight: 22,
    gapX: 14,
    gapY: 9,
    codeStart: 1,
  },
  {
    block: "B",
    sector: "Zone B",
    startX: 410,
    startY: 120,
    columns: 2,
    rows: 15,
    slotWidth: 36,
    slotHeight: 22,
    gapX: 14,
    gapY: 9,
    codeStart: 31,
  },
  {
    block: "C",
    sector: "Zone C",
    startX: 640,
    startY: 120,
    columns: 2,
    rows: 15,
    slotWidth: 36,
    slotHeight: 22,
    gapX: 14,
    gapY: 9,
    codeStart: 61,
  },
  {
    block: "D",
    sector: "Zone D",
    startX: 870,
    startY: 120,
    columns: 2,
    rows: 15,
    slotWidth: 36,
    slotHeight: 22,
    gapX: 14,
    gapY: 9,
    codeStart: 91,
  },
  {
    block: "E",
    sector: "Car Zone",
    startX: 352,
    startY: 675,
    columns: 5,
    rows: 2,
    slotWidth: 56,
    slotHeight: 32,
    gapX: 54,
    gapY: 90,
    codeStart: 121,
  },
];

const durationSeed = [4, 8, 12, 17, 24, 39, 58, 85, 120, 168, 220, 280];
const sinceLabelFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function buildSinceLabel(durationMinutes: number): string {
  const date = new Date(Date.now() - durationMinutes * 60 * 1000);

  return sinceLabelFormatter.format(date);
}

export function toDurationBucket(slot: ParkingSlot): DurationBucket {
  if (slot.status === "available") return "available";
  if (slot.durationMinutes < 5) return "< 5 min";
  if (slot.durationMinutes < 15) return "5 min - 15 min";
  if (slot.durationMinutes < 60) return "15 min - 1 hour";
  if (slot.durationMinutes < 180) return "1 hour - 3 hours";
  return "> 3 hours";
}

export function getMarkerColor(slot: ParkingSlot): MarkerColor {
  if (slot.status === "available") return "green";
  if (slot.durationMinutes < 15) return "yellow";
  if (slot.durationMinutes < 60) return "yellow";
  if (slot.durationMinutes < 180) return "orange";
  return "red";
}

export function formatDurationFull(minutes: number): string {
  if (minutes <= 0) return "available";

  const hour = Math.floor(minutes / 60);
  const min = minutes % 60;

  if (hour === 0) return `${min} minutes`;
  if (min === 0) return `${hour} hour${hour > 1 ? "s" : ""}`;

  return `${hour} hour${hour > 1 ? "s" : ""}, ${min} minutes`;
}

export function formatDurationCompact(minutes: number): string {
  if (minutes <= 0) return "0m";

  const hour = Math.floor(minutes / 60);
  const min = minutes % 60;

  if (hour === 0) return `${min}m`;
  if (min === 0) return `${hour}h`;

  return `${hour}h ${min}m`;
}

function buildParkingSlots(): ParkingSlot[] {
  const slots: ParkingSlot[] = [];
  let idCount = 1;

  clusterConfigs.forEach((config, clusterIndex) => {
    for (let col = 0; col < config.columns; col += 1) {
      for (let row = 0; row < config.rows; row += 1) {
        const localIndex = col * config.rows + row;
        const isAvailable = (row + col + clusterIndex) % 4 === 0;
        const durationMinutes = isAvailable
          ? 0
          : durationSeed[
              (row + col * 2 + clusterIndex * 3) % durationSeed.length
            ];

        const slot: ParkingSlot = {
          id: `slot-${idCount}`,
          code: String(config.codeStart + localIndex),
          sector: config.sector,
          block: config.block,
          status: isAvailable ? "available" : "occupied",
          durationMinutes,
          since: isAvailable ? "Ready now" : buildSinceLabel(durationMinutes),
          x: config.startX + col * (config.slotWidth + config.gapX),
          y: config.startY + row * (config.slotHeight + config.gapY),
          width: config.slotWidth,
          height: config.slotHeight,
          angle: 0,
          marker: "green",
        };

        slot.marker = getMarkerColor(slot);
        slots.push(slot);
        idCount += 1;
      }
    }
  });

  return slots;
}

export const parkingSlots: ParkingSlot[] = buildParkingSlots().map(
  (slot, index) => ({
    ...slot,
    code: String(index + 1),
  })
);

export const userParkingSlots: ParkingSlot[] = parkingSlots.map((slot) => ({
  ...slot,
  marker: slot.status === "available" ? "green" : "red",
}));

export function createParkingSlots(): ParkingSlot[] {
  return parkingSlots;
}

export function filterSlots(
  slots: ParkingSlot[],
  sector: string,
  duration: string
): ParkingSlot[] {
  return slots.filter((slot) => {
    const sectorMatch = sector === "All Zones" || slot.sector === sector;
    const durationMatch =
      duration === "All durations" || toDurationBucket(slot) === duration;

    return sectorMatch && durationMatch;
  });
}

export function createSummary(slots: ParkingSlot[]): ParkingSummary {
  const total = slots.length;
  const byDuration: ParkingSummary["byDuration"] = {
    available: 0,
    "< 5 min": 0,
    "5 min - 15 min": 0,
    "15 min - 1 hour": 0,
    "1 hour - 3 hours": 0,
    "> 3 hours": 0,
  };

  let available = 0;
  const occupiedDurations: number[] = [];
  const sectorMap = new Map<
    string,
    { sector: string; total: number; available: number; occupied: number }
  >();

  slots.forEach((slot) => {
    if (slot.status === "available") {
      available += 1;
    } else {
      occupiedDurations.push(slot.durationMinutes);
    }

    byDuration[toDurationBucket(slot)] += 1;

    const current = sectorMap.get(slot.sector) ?? {
      sector: slot.sector,
      total: 0,
      available: 0,
      occupied: 0,
    };

    current.total += 1;
    if (slot.status === "available") current.available += 1;
    else current.occupied += 1;

    sectorMap.set(slot.sector, current);
  });

  const occupied = total - available;
  const occupancyRate = total === 0 ? 0 : Math.round((occupied / total) * 100);

  occupiedDurations.sort((a, b) => a - b);

  let medianVisitMinutes = 0;

  if (occupiedDurations.length > 0) {
    const middle = Math.floor(occupiedDurations.length / 2);
    medianVisitMinutes =
      occupiedDurations.length % 2 === 0
        ? Math.round(
            (occupiedDurations[middle - 1] + occupiedDurations[middle]) / 2
          )
        : occupiedDurations[middle];
  }

  const bySector = Array.from(sectorMap.values()).sort((a, b) =>
    a.sector.localeCompare(b.sector)
  );

  return {
    total,
    available,
    occupied,
    occupancyRate,
    medianVisitMinutes,
    byDuration,
    bySector,
  };
}
