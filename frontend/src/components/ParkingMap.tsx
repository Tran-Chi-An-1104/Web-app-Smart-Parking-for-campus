import type { ParkingSlot } from "../types/parking";
import { markerPalette } from "../assets/parkingPalette";
import { SlotDetailCard } from "./SlotDetailCard";

interface ParkingMapProps {
  slots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  onSelectSlot: (id: string | null) => void;
}

const SLOT_VERTICAL_OFFSET = 40;

export function ParkingMap({
  slots,
  selectedSlot,
  onSelectSlot,
}: ParkingMapProps) {
  const tooltipStyle = selectedSlot
    ? {
        left:
          selectedSlot.x > 820
            ? `${Math.max(((selectedSlot.x - 250) / 1200) * 100, 8)}%`
            : `${Math.min(
                ((selectedSlot.x + selectedSlot.width + 28) / 1200) * 100,
                72
              )}%`,
        top: `${Math.min(
          ((selectedSlot.y + SLOT_VERTICAL_OFFSET + 8) / 760) * 100,
          72
        )}%`,
      }
    : undefined;

  return (
    <section className="panel map-panel">
      <div className="panel-header">
        <div>
          <h3>Parking map</h3>
          <span>Live occupancy view</span>
        </div>
      </div>

      <div className="map-frame">
        <div className="map-canvas" onMouseLeave={() => onSelectSlot(null)}>
          <div className="map-toolbar">
            <button type="button">+</button>
            <button type="button">−</button>
            <button type="button">⤢</button>
            <button type="button">↺</button>
          </div>

          <svg
            className="parking-svg"
            viewBox="0 0 1200 720"
            aria-label="Smart parking map"
          >
            <rect x="0" y="0" width="1200" height="760" fill="#eef0f2" />

            <rect x="70" y="55" width="1060" height="610" rx="22" fill="#d8d1c2" />

            <rect x="288" y="150" width="110" height="460" rx="16" fill="#bbbcc0" />
            <rect x="513" y="150" width="110" height="460" rx="16" fill="#bbbcc0" />
            <rect x="743" y="150" width="110" height="460" rx="16" fill="#bbbcc0" />
            <rect x="975" y="150" width="110" height="460" rx="16" fill="#bbbcc0" />

            <text x="200" y="130" className="map-label">Zone A</text>
            <text x="440" y="130" className="map-label">Zone B</text>
            <text x="670" y="130" className="map-label">Zone C</text>
            <text x="900" y="130" className="map-label">Zone D</text>

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
              {slots.map((slot) => {
                const isSelected = slot.id === selectedSlot?.id;

                return (
                  <g
                    key={slot.id}
                    className={`slot-group ${isSelected ? "is-selected" : ""}`}
                    transform={`translate(${slot.x} ${slot.y})`}
                    onMouseEnter={() => onSelectSlot(slot.id)}
                    onMouseLeave={() => onSelectSlot(null)}
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
          </svg>

          {selectedSlot && tooltipStyle && (
            <SlotDetailCard slot={selectedSlot} style={tooltipStyle} />
          )}

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