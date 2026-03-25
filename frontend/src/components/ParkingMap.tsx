import {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { markerPalette } from "../assets/parkingPalette";
import type { MarkerColor, ParkingSlot } from "../types/parking";
import { SlotDetailCard } from "./SlotDetailCard";
import { UserSlotDetailCard } from "./UserSlotDetailCard";

export type ParkingMapMode = "admin" | "user";

interface ParkingMapProps {
  mode: ParkingMapMode;
  slots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  onSelectSlot: (id: string | null) => void;
}

interface ParkingSlotGroupProps {
  slot: ParkingSlot;
  isSelected: boolean;
  isDragging: boolean;
  onHoverSlot: (id: string | null) => void;
}

const SLOT_VERTICAL_OFFSET = 40;
const MAP_WIDTH = 1200;
const MAP_HEIGHT = 1040;
const MAP_CENTER_X = MAP_WIDTH / 2;
const MAP_CENTER_Y = MAP_HEIGHT / 2;
const MIN_SCALE = 1;
const MAX_SCALE = 2.5;

const mapContent: Record<
  ParkingMapMode,
  {
    title: string;
    subtitle: string;
    ariaLabel: string;
    legend: Array<{ color: MarkerColor; label: string }>;
    detailHeight: number;
  }
> = {
  admin: {
    title: "Parking map",
    subtitle: "Live occupancy view",
    ariaLabel: "Smart parking map",
    legend: [
      { color: "green", label: "available" },
      { color: "yellow", label: "< 15 min" },
      { color: "orange", label: "15 min - 3 hours" },
      { color: "red", label: "> 3 hours" },
    ],
    detailHeight: 240,
  },
  user: {
    title: "Parking availability map",
    subtitle: "Check whether each slot is free or occupied",
    ariaLabel: "User parking availability map",
    legend: [
      { color: "green", label: "available" },
      { color: "red", label: "occupied" },
    ],
    detailHeight: 200,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const StaticMapLayer = memo(function StaticMapLayer() {
  return (
    <image
      href="/parking-map-base.svg"
      x="0"
      y="0"
      width={MAP_WIDTH}
      height={MAP_HEIGHT}
      preserveAspectRatio="none"
      aria-hidden="true"
    />
  );
});

const ParkingSlotGroup = memo(
  function ParkingSlotGroup({
    slot,
    isSelected,
    isDragging,
    onHoverSlot,
  }: ParkingSlotGroupProps) {
    return (
      <g
        data-slot-id={slot.id}
        className={`slot-group ${isSelected ? "is-selected" : ""}`}
        transform={`translate(${slot.x} ${slot.y})`}
        onMouseEnter={() => {
          if (!isDragging) onHoverSlot(slot.id);
        }}
        onMouseLeave={() => {
          if (!isDragging) onHoverSlot(null);
        }}
      >
        <rect
          x="0"
          y="0"
          rx="4"
          ry="4"
          width={slot.width}
          height={slot.height}
          fill={isSelected ? "#d9ebff" : "#b9cde0"}
          stroke={isSelected ? "#2d4d6e" : "#6f8aa3"}
          strokeWidth={isSelected ? 1.8 : 1}
        />

        <circle
          cx={slot.width - 7}
          cy={slot.height / 2}
          r="4.8"
          fill={markerPalette[slot.marker]}
          stroke="#475569"
          strokeWidth="0.6"
        />

        <text x="5" y={slot.height / 2 + 3.1} className="slot-code">
          {slot.code}
        </text>
      </g>
    );
  },
  (prevProps, nextProps) =>
    prevProps.slot === nextProps.slot &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDragging === nextProps.isDragging
);

export function ParkingMap({
  mode,
  slots,
  selectedSlot,
  onSelectSlot,
}: ParkingMapProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const scaleRef = useRef(scale);
  const panRef = useRef(pan);
  const panFrameRef = useRef<number | null>(null);
  const pendingPanRef = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const selectedSlotId = selectedSlot?.id ?? null;
  const content = mapContent[mode];

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const setPanImmediate = useCallback((nextPan: { x: number; y: number }) => {
    panRef.current = nextPan;
    setPan(nextPan);
  }, []);

  const schedulePanUpdate = useCallback(
    (nextPan: { x: number; y: number }) => {
      pendingPanRef.current = nextPan;

      if (panFrameRef.current !== null) return;

      panFrameRef.current = window.requestAnimationFrame(() => {
        panFrameRef.current = null;

        if (!pendingPanRef.current) return;

        setPanImmediate(pendingPanRef.current);
        pendingPanRef.current = null;
      });
    },
    [setPanImmediate]
  );

  const resetView = useCallback(() => {
    if (panFrameRef.current !== null) {
      window.cancelAnimationFrame(panFrameRef.current);
      panFrameRef.current = null;
    }

    pendingPanRef.current = null;
    scaleRef.current = 1;
    setScale(1);
    setPanImmediate({ x: 0, y: 0 });
  }, [setPanImmediate]);

  const zoomAt = useCallback(
    (clientX: number, clientY: number, zoomFactor: number) => {
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = ((clientX - rect.left) / rect.width) * MAP_WIDTH;
      const mouseY = ((clientY - rect.top) / rect.height) * MAP_HEIGHT;
      const currentScale = scaleRef.current;
      const currentPan = panRef.current;
      const nextScale = clamp(currentScale * zoomFactor, MIN_SCALE, MAX_SCALE);

      if (nextScale === currentScale) return;

      const ratio = nextScale / currentScale;
      const nextPan = {
        x:
          mouseX -
          MAP_CENTER_X -
          ratio * (mouseX - MAP_CENTER_X - currentPan.x),
        y:
          mouseY -
          MAP_CENTER_Y -
          ratio * (mouseY - MAP_CENTER_Y - currentPan.y),
      };

      scaleRef.current = nextScale;
      setPanImmediate(nextPan);
      setScale(nextScale);
    },
    [setPanImmediate]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      zoomAt(event.clientX, event.clientY, event.deltaY < 0 ? 1.2 : 0.8);
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [zoomAt]);

  useEffect(() => {
    const handleWindowMouseMove = (event: MouseEvent) => {
      if (!dragRef.current || !svgRef.current) return;

      event.preventDefault();

      const rect = svgRef.current.getBoundingClientRect();
      const deltaX =
        ((event.clientX - dragRef.current.startX) / rect.width) * MAP_WIDTH;
      const deltaY =
        ((event.clientY - dragRef.current.startY) / rect.height) * MAP_HEIGHT;

      schedulePanUpdate({
        x: dragRef.current.originX + deltaX,
        y: dragRef.current.originY + deltaY,
      });
    };

    const stopDragging = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", stopDragging);

      if (panFrameRef.current !== null) {
        window.cancelAnimationFrame(panFrameRef.current);
      }
    };
  }, [schedulePanUpdate]);

  const handleHoverSlot = useCallback(
    (id: string | null) => {
      startTransition(() => {
        onSelectSlot(id);
      });
    },
    [onSelectSlot]
  );

  const mapTransform = useMemo(
    () => `
      translate(${MAP_CENTER_X + pan.x} ${MAP_CENTER_Y + pan.y})
      scale(${scale})
      translate(${-MAP_CENTER_X} ${-MAP_CENTER_Y})
    `,
    [pan.x, pan.y, scale]
  );

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    event.preventDefault();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: panRef.current.x,
      originY: panRef.current.y,
    };

    setIsDragging(true);
    onSelectSlot(null);
  };

  useLayoutEffect(() => {
    const tooltip = tooltipRef.current;

    if (!tooltip) return;

    tooltip.style.visibility = "hidden";

    if (!selectedSlot || !canvasRef.current || isDragging) return;

    const slotElement = canvasRef.current.querySelector(
      `[data-slot-id="${selectedSlot.id}"]`
    ) as SVGGElement | null;

    if (!slotElement) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const slotRect = slotElement.getBoundingClientRect();
    const cardWidth = 290;
    const gap = 14;

    const showLeft = slotRect.right - canvasRect.left > canvasRect.width * 0.72;
    let left = showLeft
      ? slotRect.left - canvasRect.left - cardWidth - gap
      : slotRect.right - canvasRect.left + gap;

    let top =
      slotRect.top -
      canvasRect.top +
      slotRect.height / 2 -
      content.detailHeight / 2;

    left = clamp(left, 8, canvasRect.width - cardWidth - 8);
    top = clamp(top, 8, canvasRect.height - content.detailHeight - 8);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.visibility = "visible";
  }, [content.detailHeight, isDragging, pan.x, pan.y, scale, selectedSlot]);

  return (
    <section className="panel map-panel">
      <div className="panel-header">
        <div>
          <h3>{content.title}</h3>
          <span>{content.subtitle}</span>
        </div>
      </div>

      <div className="map-frame">
        <div
          ref={canvasRef}
          className={`map-canvas ${isDragging ? "is-dragging" : ""}`}
          onMouseDown={handleMouseDown}
          onDoubleClick={resetView}
          onMouseLeave={() => {
            if (!isDragging) onSelectSlot(null);
          }}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <svg
            ref={svgRef}
            className="parking-svg"
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            aria-label={content.ariaLabel}
          >
            <g transform={mapTransform}>
              <StaticMapLayer />

              <g transform={`translate(0 ${SLOT_VERTICAL_OFFSET})`}>
                {slots.map((slot) => (
                  <ParkingSlotGroup
                    key={slot.id}
                    slot={slot}
                    isSelected={slot.id === selectedSlotId}
                    isDragging={isDragging}
                    onHoverSlot={handleHoverSlot}
                  />
                ))}
              </g>
            </g>
          </svg>

          {selectedSlot ? (
            mode === "admin" ? (
              <SlotDetailCard ref={tooltipRef} slot={selectedSlot} />
            ) : (
              <UserSlotDetailCard ref={tooltipRef} slot={selectedSlot} />
            )
          ) : null}

          <div className="map-legend">
            {content.legend.map((item) => (
              <div className="legend-item" key={`${mode}-${item.color}-${item.label}`}>
                <span className={`legend-dot ${item.color}`} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
