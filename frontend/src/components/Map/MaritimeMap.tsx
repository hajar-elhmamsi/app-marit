import React, { useEffect, useRef, useState } from 'react';
import { 
  Compass, 
  Layers, 
  Wind, 
  ShieldAlert, 
  Ruler, 
  Eye, 
  Navigation as NavIcon, 
  Anchor, 
  Gauge, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import L from 'leaflet';
import { Vessel } from '../../data/mockVessels';
import { MAJOR_PORTS } from '../../data/mockPorts';
import { calculateNauticalDistance, calculateBearing, formatNauticalCoords } from '../../utils/maritimeMath';
import { sounds } from '../../utils/soundEffects';

interface MaritimeMapProps {
  vessels: Vessel[];
  selectedVessel: Vessel | null;
  onSelectVessel: (vessel: Vessel) => void;
  onInspectDigitalTwin: (vessel: Vessel) => void;
}

export const MaritimeMap: React.FC<MaritimeMapProps> = ({
  vessels,
  selectedVessel,
  onSelectVessel,
  onInspectDigitalTwin
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const routesGroupRef = useRef<L.LayerGroup | null>(null);
  const zonesGroupRef = useRef<L.LayerGroup | null>(null);

  // Map Layer States
  const [showSeaMarks, setShowSeaMarks] = useState<boolean>(true);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState<boolean>(true);
  const [showZones, setShowZones] = useState<boolean>(true);
  const [measuringMode, setMeasuringMode] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureDistanceNM, setMeasureDistanceNM] = useState<number | null>(null);
  const [measureBearing, setMeasureBearing] = useState<number | null>(null);

  const seaMarksTileRef = useRef<L.TileLayer | null>(null);

  // Get color for vessel type
  const getVesselColor = (type: Vessel['type']) => {
    switch (type) {
      case 'Container': return '#00f5d4'; // Cyan
      case 'Oil Tanker': return '#f43f5e'; // Rose/Red
      case 'LNG Carrier': return '#10b981'; // Emerald
      case 'Bulk Carrier': return '#f59e0b'; // Amber
      case 'Tug / Salvage': return '#a855f7'; // Purple
      default: return '#38bdf8';
    }
  };

  // Create custom SVG ship icon
  const createVesselIcon = (vessel: Vessel, isSelected: boolean) => {
    const color = getVesselColor(vessel.type);
    const size = isSelected ? 42 : 34;
    
    const svgHtml = `
      <div class="vessel-marker-wrapper" style="
        width: ${size}px;
        height: ${size}px;
        transform: rotate(${vessel.course}deg);
      ">
        <svg viewBox="0 0 36 36" width="${size}" height="${size}">
          <filter id="glow-${vessel.id}">
            <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${color}" flood-opacity="0.8"/>
          </filter>
          <!-- Vessel Hull -->
          <path d="M 18 2 L 28 14 L 27 31 L 9 31 L 8 14 Z" 
            fill="${color}" 
            stroke="${isSelected ? '#ffffff' : '#070c18'}" 
            stroke-width="${isSelected ? 2.5 : 1.5}"
            filter="url(#glow-${vessel.id})"
          />
          <!-- Bridge superstructure -->
          <rect x="13" y="19" width="10" height="7" rx="1.5" fill="#0c1527" />
          <!-- Heading line vector -->
          <line x1="18" y1="2" x2="18" y2="-6" stroke="${color}" stroke-width="2" stroke-dasharray="2 2" />
        </svg>
      </div>
    `;

    return L.divIcon({
      className: 'custom-vessel-marker',
      html: svgHtml,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map centered in Mediterranean / Middle East maritime corridor
    const map = L.map(mapContainerRef.current, {
      center: [25.0, 45.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // CartoDB Dark Matter base tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // OpenSeaMap Seamarks Layer
    const seaMarks = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; OpenSeaMap contributors',
      maxZoom: 18,
      opacity: 0.85
    });
    seaMarks.addTo(map);
    seaMarksTileRef.current = seaMarks;

    routesGroupRef.current = L.layerGroup().addTo(map);
    zonesGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Handle clicks for measuring tool
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (measuringMode) {
        sounds.playSonarBlip();
        setMeasurePoints((prev) => {
          if (prev.length >= 2) {
            return [[e.latlng.lat, e.latlng.lng]];
          }
          const next: [number, number][] = [...prev, [e.latlng.lat, e.latlng.lng]];
          if (next.length === 2) {
            const dist = calculateNauticalDistance(
              { lat: next[0][0], lng: next[0][1] },
              { lat: next[1][0], lng: next[1][1] }
            );
            const brng = calculateBearing(
              { lat: next[0][0], lng: next[0][1] },
              { lat: next[1][0], lng: next[1][1] }
            );
            setMeasureDistanceNM(dist);
            setMeasureBearing(brng);
          }
          return next;
        });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Seamarks Layer Visibility
  useEffect(() => {
    if (!mapInstanceRef.current || !seaMarksTileRef.current) return;
    if (showSeaMarks) {
      if (!mapInstanceRef.current.hasLayer(seaMarksTileRef.current)) {
        seaMarksTileRef.current.addTo(mapInstanceRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(seaMarksTileRef.current)) {
        mapInstanceRef.current.removeLayer(seaMarksTileRef.current);
      }
    }
  }, [showSeaMarks]);

  // Render Maritime Zones (ECA & Piracy HRA)
  useEffect(() => {
    if (!zonesGroupRef.current) return;
    zonesGroupRef.current.clearLayers();

    if (showZones) {
      // Mediterranean ECA Zone
      const medEcaPolygon = L.polygon(
        [
          [36.0, -5.5],
          [43.0, 5.0],
          [45.5, 13.0],
          [40.0, 20.0],
          [35.0, 35.0],
          [31.5, 34.0],
          [31.0, 25.0],
          [34.0, 10.0],
          [35.5, -2.0]
        ],
        {
          color: '#38bdf8',
          fillColor: '#0284c7',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4 4'
        }
      ).bindTooltip('Mediterranean SECA (0.1% Sulphur Emission Control Area)', { sticky: true });
      zonesGroupRef.current.addLayer(medEcaPolygon);

      // Piracy High Risk Area (HRA - Gulf of Aden / Indian Ocean)
      const piracyPolygon = L.polygon(
        [
          [15.0, 43.5],
          [18.0, 56.0],
          [10.0, 65.0],
          [-5.0, 55.0],
          [-1.0, 42.0],
          [12.0, 43.0]
        ],
        {
          color: '#f43f5e',
          fillColor: '#e11d48',
          fillOpacity: 0.1,
          weight: 1.5,
          dashArray: '6 6'
        }
      ).bindTooltip('High Risk Area (HRA) - BMP5 Anti-Piracy Watch Zone', { sticky: true });
      zonesGroupRef.current.addLayer(piracyPolygon);
    }
  }, [showZones]);

  // Render Ports
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    MAJOR_PORTS.forEach((port) => {
      const portMarkerHtml = `
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #f59e0b;
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px #f59e0b;
        "></div>
      `;
      const portIcon = L.divIcon({
        className: 'port-marker',
        html: portMarkerHtml,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      L.marker([port.lat, port.lng], { icon: portIcon })
        .bindTooltip(`<strong>${port.name}</strong> (${port.code})<br/>Berths: ${port.berthsOccupied}/${port.berthsTotal}`, {
          direction: 'top'
        })
        .addTo(map);
    });
  }, []);

  // Update Vessel Markers & Selected Route Polyline
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    vessels.forEach((vessel) => {
      const isSelected = selectedVessel?.id === vessel.id;
      const icon = createVesselIcon(vessel, isSelected);

      if (markersRef.current[vessel.id]) {
        markersRef.current[vessel.id].setLatLng([vessel.lat, vessel.lng]);
        markersRef.current[vessel.id].setIcon(icon);
      } else {
        const marker = L.marker([vessel.lat, vessel.lng], { icon });
        marker.on('click', () => {
          sounds.playSonarBlip();
          onSelectVessel(vessel);
        });
        marker.addTo(map);
        markersRef.current[vessel.id] = marker;
      }
    });

    // Draw active vessel route polyline
    if (routesGroupRef.current) {
      routesGroupRef.current.clearLayers();
      if (selectedVessel && selectedVessel.routeWaypoints.length > 0) {
        const polyline = L.polyline(selectedVessel.routeWaypoints, {
          color: getVesselColor(selectedVessel.type),
          weight: 3,
          dashArray: '6 8',
          opacity: 0.85
        });
        routesGroupRef.current.addLayer(polyline);

        // Add waypoint markers
        selectedVessel.routeWaypoints.forEach((pt, idx) => {
          const wpMarker = L.circleMarker(pt, {
            radius: 4,
            color: '#ffffff',
            fillColor: getVesselColor(selectedVessel.type),
            fillOpacity: 1,
            weight: 2
          }).bindTooltip(`WP ${idx + 1}: [${pt[0].toFixed(2)}°, ${pt[1].toFixed(2)}°]`, { direction: 'right' });
          routesGroupRef.current?.addLayer(wpMarker);
        });
      }
    }
  }, [vessels, selectedVessel]);

  // Center on selected vessel
  const handleCenterVessel = (vessel: Vessel) => {
    if (mapInstanceRef.current) {
      sounds.playSonarBlip();
      mapInstanceRef.current.flyTo([vessel.lat, vessel.lng], 6, { duration: 1.2 });
      onSelectVessel(vessel);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* Map Element */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Floating Map Controls */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 500
      }}>
        <div className="glass-panel" style={{
          padding: '0.4rem 0.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <button
            className={`btn ${showSeaMarks ? 'btn-tactical' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            onClick={() => { setShowSeaMarks(!showSeaMarks); sounds.playButtonBeep(); }}
            title="Toggle OpenSeaMap Nautical Marks"
          >
            <Layers size={14} />
            <span>Nautical Marks</span>
          </button>

          <button
            className={`btn ${showZones ? 'btn-tactical' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            onClick={() => { setShowZones(!showZones); sounds.playButtonBeep(); }}
            title="Toggle ECA / SECA & Piracy Zones"
          >
            <ShieldAlert size={14} />
            <span>ECA & Risk Zones</span>
          </button>

          <button
            className={`btn ${measuringMode ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
            onClick={() => {
              setMeasuringMode(!measuringMode);
              setMeasurePoints([]);
              setMeasureDistanceNM(null);
              sounds.playButtonBeep();
            }}
            title="Measure Great Circle Distance (NM)"
          >
            <Ruler size={14} />
            <span>{measuringMode ? 'Measuring Active...' : 'Measure (NM)'}</span>
          </button>
        </div>

        {/* Measuring Result Indicator */}
        {measuringMode && measureDistanceNM !== null && (
          <div className="glass-panel" style={{
            padding: '0.4rem 0.85rem',
            background: 'rgba(0, 245, 212, 0.15)',
            borderColor: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-cyan)', fontFamily: 'var(--font-mono)' }}>
              Distance: <strong>{measureDistanceNM} NM</strong>
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-cyan)', fontFamily: 'var(--font-mono)' }}>
              Bearing: <strong>{measureBearing}° T</strong>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Steaming @18kts: <strong>{(measureDistanceNM / 18).toFixed(1)} hrs</strong>
            </span>
          </div>
        )}
      </div>

      {/* Right Tactical AIS Vessel Inspector Drawer */}
      {selectedVessel && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          width: '360px',
          maxHeight: 'calc(100% - 2rem)',
          overflowY: 'auto',
          zIndex: 500,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{selectedVessel.name}</h3>
                <span className="badge" style={{
                  background: `${getVesselColor(selectedVessel.type)}22`,
                  color: getVesselColor(selectedVessel.type),
                  borderColor: getVesselColor(selectedVessel.type)
                }}>
                  {selectedVessel.type}
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                IMO: <strong style={{ color: 'var(--text-secondary)' }}>{selectedVessel.imo}</strong> | MMSI: {selectedVessel.mmsi} | Flag: {selectedVessel.flag}
              </p>
            </div>
            <button
              onClick={() => handleCenterVessel(selectedVessel)}
              className="btn btn-secondary btn-icon"
              title="Center on Ship"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          {/* Navigation Telemetry Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div className="glass-card" style={{ padding: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SPEED (SOG)</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '3px' }}>
                <span className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  {selectedVessel.speedKnots}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>knots</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HEADING (COG)</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '3px' }}>
                <span className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                  {selectedVessel.course}°
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>True</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DRAUGHT</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '3px' }}>
                <span className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedVessel.draughtM}m
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ {selectedVessel.maxDraughtM}m</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>IMO CII RATING</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '3px' }}>
                <span className="badge badge-emerald" style={{ fontSize: '1rem', fontWeight: 800 }}>
                  Grade {selectedVessel.ciiRating}
                </span>
              </div>
            </div>
          </div>

          {/* Voyage Leg */}
          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Voyage Corridor</span>
              <span className="badge badge-cyan">{selectedVessel.status}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{selectedVessel.origin}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Port of Origin</div>
              </div>
              <ChevronRight size={18} color="var(--accent-cyan)" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{selectedVessel.destination}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>ETA: {selectedVessel.eta}</div>
              </div>
            </div>
            <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              GPS Position: <span className="mono" style={{ color: 'var(--text-cyan)' }}>{formatNauticalCoords(selectedVessel.lat, selectedVessel.lng)}</span>
            </div>
          </div>

          {/* Quick Engine Telemetry Bar */}
          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MAIN ENGINE TELEMETRY</span>
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                {selectedVessel.telemetry.rpm} RPM ({selectedVessel.telemetry.engineLoadPct}%)
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${selectedVessel.telemetry.engineLoadPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-gold))'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <span>Flow: {selectedVessel.telemetry.fuelFlowLitersPerHour} L/h</span>
              <span>Shaft: {(selectedVessel.telemetry.shaftPowerKW / 1000).toFixed(1)} MW</span>
            </div>
          </div>

          {/* Action Button to Digital Twin */}
          <button
            className="btn btn-primary"
            onClick={() => {
              sounds.playButtonBeep();
              onInspectDigitalTwin(selectedVessel);
            }}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            <Gauge size={18} />
            <span>Launch Vessel Digital Twin</span>
          </button>
        </div>
      )}

      {/* Bottom Fleet Quick Switcher Carousel */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        right: selectedVessel ? '390px' : '1rem',
        display: 'flex',
        gap: '0.65rem',
        overflowX: 'auto',
        padding: '0.5rem',
        zIndex: 500
      }}>
        {vessels.map((v) => {
          const isSelected = selectedVessel?.id === v.id;
          return (
            <div
              key={v.id}
              onClick={() => handleCenterVessel(v)}
              className="glass-panel"
              style={{
                minWidth: '220px',
                padding: '0.65rem 0.85rem',
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(0, 245, 212, 0.12)' : 'var(--bg-glass)',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{v.name}</span>
                <span className="badge" style={{
                  fontSize: '0.62rem',
                  color: getVesselColor(v.type),
                  borderColor: getVesselColor(v.type)
                }}>
                  {v.type}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>{v.speedKnots} kts / {v.course}°</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{v.destCode}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
