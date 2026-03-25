import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { ParkingSlot } from "../types/parking";
import { markerPalette } from "../assets/parkingPalette";
import { SlotDetailCard } from "./SlotDetailCard";

interface ParkingMapProps {
  slots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  onSelectSlot: (id: string | null) => void;
}

const SLOT_VERTICAL_OFFSET = 40;
const MAP_WIDTH = 1200;
const MAP_HEIGHT = 1040;
const MAP_CENTER_X = MAP_WIDTH / 2;
const MAP_CENTER_Y = MAP_HEIGHT / 2;

const MIN_SCALE = 1;
const MAX_SCALE = 2.5;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ParkingMap({
  slots,
  selectedSlot,
  onSelectSlot,
}: ParkingMapProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<CSSProperties | undefined>();

  const scaleRef = useRef(scale);
  const panRef = useRef(pan);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const zoomAt = (clientX: number, clientY: number, zoomFactor: number) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width) * MAP_WIDTH;
    const mouseY = ((clientY - rect.top) / rect.height) * MAP_HEIGHT;

    const currentScale = scaleRef.current;
    const currentPan = panRef.current;
    const nextScale = clamp(currentScale * zoomFactor, MIN_SCALE, MAX_SCALE);

    if (nextScale === currentScale) return;

    const ratio = nextScale / currentScale;

    setPan({
      x:
        mouseX -
        MAP_CENTER_X -
        ratio * (mouseX - MAP_CENTER_X - currentPan.x),
      y:
        mouseY -
        MAP_CENTER_Y -
        ratio * (mouseY - MAP_CENTER_Y - currentPan.y),
    });

    setScale(nextScale);
  };

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
  }, []);

  useEffect(() => {
    const handleWindowMouseMove = (event: MouseEvent) => {
      if (!dragRef.current || !svgRef.current) return;

      event.preventDefault();

      const rect = svgRef.current.getBoundingClientRect();
      const deltaX =
        ((event.clientX - dragRef.current.startX) / rect.width) * MAP_WIDTH;
      const deltaY =
        ((event.clientY - dragRef.current.startY) / rect.height) * MAP_HEIGHT;

      setPan({
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
    };
  }, []);

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
    if (!selectedSlot || !canvasRef.current || isDragging) {
      setTooltipStyle(undefined);
      return;
    }

    const slotElement = canvasRef.current.querySelector(
      `[data-slot-id="${selectedSlot.id}"]`
    ) as SVGGElement | null;

    if (!slotElement) {
      setTooltipStyle(undefined);
      return;
    }

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const slotRect = slotElement.getBoundingClientRect();

    const cardWidth = 290;
    const cardHeight = 240;
    const gap = 14;

    const showLeft = slotRect.right - canvasRect.left > canvasRect.width * 0.72;

    let left = showLeft
      ? slotRect.left - canvasRect.left - cardWidth - gap
      : slotRect.right - canvasRect.left + gap;

    let top =
      slotRect.top -
      canvasRect.top +
      slotRect.height / 2 -
      cardHeight / 2;

    left = clamp(left, 8, canvasRect.width - cardWidth - 8);
    top = clamp(top, 8, canvasRect.height - cardHeight - 8);

    setTooltipStyle({
      left: `${left}px`,
      top: `${top}px`,
    });
  }, [selectedSlot, scale, pan, isDragging]);

  return (
    <section className="panel map-panel">
      <div className="panel-header">
        <div>
          <h3>Parking map</h3>
          <span>Live occupancy view</span>
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
            aria-label="Smart parking map"
          >
            <g
              transform={`
                translate(${MAP_CENTER_X + pan.x} ${MAP_CENTER_Y + pan.y})
                scale(${scale})
                translate(${-MAP_CENTER_X} ${-MAP_CENTER_Y})
              `}
            >
              <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="#eef0f2" />

              <rect x="70" y="55" width="1060" height="900" rx="22" fill="#d8d1c2" />

              <rect x="288" y="150" width="110" height="460" rx="16" fill="#bbbcc0" />
              <rect x="513" y="150" width="110" height="460" rx="16" fill="#bbbcc0" />
              <rect x="743" y="150" width="110" height="460" rx="16" fill="#bbbcc0" />
              <rect x="975" y="150" width="110" height="460" rx="16" fill="#bbbcc0" />

              <text x="200" y="130" className="map-label">
                Zone A
              </text>
              <text x="440" y="130" className="map-label">
                Zone B
              </text>
              <text x="670" y="130" className="map-label">
                Zone C
              </text>
              <text x="900" y="130" className="map-label">
                Zone D
              </text>

              {/* Entry box - top left */}
              <g>
                <rect
                  x="80"
                  y="78"
                  width="110"
                  height="44"
                  rx="12"
                  fill="#fff700"
                  stroke="#64748b"
                  strokeWidth="1.4"
                />
                <text
                  x="135"
                  y="105"
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="700"
                  fill="#334155"
                >
                  Entry/Exit
                </text>
              </g>

              <g transform={`translate(0 ${SLOT_VERTICAL_OFFSET})`}>
                <g aria-hidden="true">
                  <rect
                    x="326"
                    y="650"
                    width="558"
                    height="232"
                    rx="18"
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="4"
                    opacity="0.9"
                  />

                  <rect
                    x="344"
                    y="667"
                    width="72"
                    height="48"
                    rx="6"
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="3"
                  />
                  <rect
                    x="454"
                    y="667"
                    width="72"
                    height="48"
                    rx="6"
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="3"
                  />
                  <rect
                    x="564"
                    y="667"
                    width="72"
                    height="48"
                    rx="6"
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="3"
                  />
                  <rect
                    x="674"
                    y="667"
                    width="72"
                    height="48"
                    rx="6"
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="3"
                  />
                  <rect
                    x="784"
                    y="667"
                    width="72"
                    height="48"
                    rx="6"
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="3"
                  />

                  <rect
                    x="344"
                    y="789"
                    width="72"
                    height="48"
                    rx="6"
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="3"
                  />
                  <rect
                    x="454"
                    y="789"
                    width="72"
                    height="48"
                    rx="6"
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="3"
                  />
                  <rect
                    x="564"
                    y="789"
                    width="72"
                    height="48"
                    rx="6"
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="3"
                  />
                  <rect
                    x="674"
                    y="789"
                    width="72"
                    height="48"
                    rx="6"
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="3"
                  />
                  <rect
                    x="784"
                    y="789"
                    width="72"
                    height="48"
                    rx="6"
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="3"
                  />

                  <line
                    x1="344"
                    y1="752"
                    x2="856"
                    y2="752"
                    stroke="#f8fafc"
                    strokeWidth="3"
                    strokeDasharray="24 14"
                    opacity="0.95"
                  />
                </g>

                {slots.map((slot) => {
                  const isSelected = slot.id === selectedSlot?.id;

                  return (
                    <g
                      key={slot.id}
                      data-slot-id={slot.id}
                      className={`slot-group ${isSelected ? "is-selected" : ""}`}
                      transform={`translate(${slot.x} ${slot.y})`}
                      onMouseEnter={() => {
                        if (!isDragging) onSelectSlot(slot.id);
                      }}
                      onMouseLeave={() => {
                        if (!isDragging) onSelectSlot(null);
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
                })}
              </g>
            </g>
          </svg>

          {selectedSlot && tooltipStyle ? (
            <SlotDetailCard slot={selectedSlot} style={tooltipStyle} />
          ) : null}

          <div className="map-legend">
            <div className="legend-item">
              <span className="legend-dot green" />
              available
            </div>
            <div className="legend-item">
              <span className="legend-dot yellow" />
              &lt; 15 min
            </div>
            <div className="legend-item">
              <span className="legend-dot orange" />
              15 min - 3 hours
            </div>
            <div className="legend-item">
              <span className="legend-dot red" />
              &gt; 3 hours
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
