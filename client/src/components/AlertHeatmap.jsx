import React, { useMemo, useState } from 'react';
import { MapPin, Globe } from 'lucide-react';

/**
 * Converts lat/lng to Mercator-projected SVG coordinates on an 800x400 viewBox.
 */
function latLngToSvg(lat, lng) {
  const x = ((lng + 180) / 360) * 800;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = 200 - (mercN / Math.PI) * 200;
  return { x: Math.max(0, Math.min(800, x)), y: Math.max(0, Math.min(400, y)) };
}

/**
 * Simplified world map outline paths for a lightweight SVG heatmap.
 * These are simplified continental outlines — enough for context without a mapping library.
 */
const CONTINENTS = [
  // North America (simplified)
  'M60,80 L130,60 L180,80 L200,100 L180,140 L150,170 L120,180 L100,160 L70,140 L50,120 Z',
  // South America (simplified)
  'M140,190 L170,180 L190,200 L195,240 L180,290 L160,320 L140,310 L130,270 L120,230 L130,200 Z',
  // Europe (simplified)
  'M370,60 L400,50 L430,55 L440,70 L430,90 L410,100 L380,95 L370,80 Z',
  // Africa (simplified)
  'M370,120 L410,110 L440,130 L450,170 L440,220 L420,260 L390,270 L370,250 L360,200 L355,160 Z',
  // Asia (simplified)
  'M440,40 L520,30 L600,40 L650,60 L660,80 L640,110 L600,130 L560,140 L510,130 L470,120 L450,100 L440,70 Z',
  // Australia (simplified)
  'M600,250 L650,240 L680,260 L670,290 L640,300 L610,290 L600,270 Z',
  // India subcontinent (simplified)
  'M510,130 L530,120 L540,140 L535,170 L520,180 L505,165 L505,145 Z'
];

export default function AlertHeatmap({ alerts = [] }) {
  const [hoveredAlert, setHoveredAlert] = useState(null);

  const alertDots = useMemo(() => {
    return alerts
      .filter(a => a.latitude != null && a.longitude != null)
      .map((alert, idx) => {
        const { x, y } = latLngToSvg(alert.latitude, alert.longitude);
        const isCritical = alert.severity === 'CRITICAL';
        return {
          ...alert,
          _idx: idx,
          _x: x,
          _y: y,
          _isCritical: isCritical,
          _radius: isCritical ? 6 : 4
        };
      });
  }, [alerts]);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <Globe className="w-4 h-4 text-rose-400" />
          <span>Counterfeit Incident Heatmap</span>
        </h3>
        <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-500">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
            <span>CRITICAL</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
            <span>WARNING</span>
          </span>
        </div>
      </div>

      {/* SVG Map */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950/60 border border-slate-800/60">
        <svg
          viewBox="0 0 800 400"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines */}
          {[0, 100, 200, 300, 400, 500, 600, 700, 800].map(x => (
            <line key={`vg-${x}`} x1={x} y1={0} x2={x} y2={400} stroke="#1E293B" strokeWidth={0.5} />
          ))}
          {[0, 100, 200, 300, 400].map(y => (
            <line key={`hg-${y}`} x1={0} y1={y} x2={800} y2={y} stroke="#1E293B" strokeWidth={0.5} />
          ))}

          {/* Equator */}
          <line x1={0} y1={200} x2={800} y2={200} stroke="#334155" strokeWidth={0.8} strokeDasharray="6,4" />

          {/* Continent outlines */}
          {CONTINENTS.map((path, i) => (
            <path
              key={`cont-${i}`}
              d={path}
              fill="#1E293B"
              stroke="#334155"
              strokeWidth={0.8}
              opacity={0.6}
            />
          ))}

          {/* Alert dot glows (outer halo) */}
          {alertDots.map(dot => (
            <circle
              key={`glow-${dot._idx}`}
              cx={dot._x}
              cy={dot._y}
              r={dot._radius * 2.5}
              fill={dot._isCritical ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.12)'}
            >
              <animate attributeName="r" values={`${dot._radius * 2};${dot._radius * 3.5};${dot._radius * 2}`} dur="2s" repeatCount="indefinite" />
            </circle>
          ))}

          {/* Alert dots */}
          {alertDots.map(dot => (
            <circle
              key={`dot-${dot._idx}`}
              cx={dot._x}
              cy={dot._y}
              r={dot._radius}
              fill={dot._isCritical ? '#EF4444' : '#F59E0B'}
              stroke={dot._isCritical ? '#FCA5A5' : '#FCD34D'}
              strokeWidth={1}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredAlert(dot)}
              onMouseLeave={() => setHoveredAlert(null)}
            >
              <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredAlert && (
          <div
            className="absolute z-10 p-3 rounded-xl bg-slate-900/95 border border-rose-500/40 shadow-xl text-xs font-mono max-w-xs pointer-events-none"
            style={{
              left: `${(hoveredAlert._x / 800) * 100}%`,
              top: `${Math.max(0, (hoveredAlert._y / 400) * 100 - 20)}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="flex items-center space-x-2 mb-1">
              <MapPin className="w-3 h-3 text-rose-400" />
              <span className="font-bold text-white">{hoveredAlert.product_id}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${hoveredAlert._isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {hoveredAlert.severity}
              </span>
            </div>
            <div className="text-rose-300">{hoveredAlert.rule_failed}</div>
            <div className="text-slate-400 mt-1">
              {hoveredAlert.latitude?.toFixed(4)}, {hoveredAlert.longitude?.toFixed(4)}
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[10px] text-slate-600 font-mono">
        {alertDots.length} geo-located incident{alertDots.length !== 1 ? 's' : ''} plotted • Mercator projection
      </div>
    </div>
  );
}
