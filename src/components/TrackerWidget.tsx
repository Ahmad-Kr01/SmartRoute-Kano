import React, { useState, useEffect, useRef } from 'react';
import { Route, Play, RefreshCw, Navigation, ShieldCheck, Zap, Layers, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const KANO_HUBS = [
  { id: 'dala', name: 'Dala Logistics Hub', x: 80, y: 80, hue: 'text-orange-500' },
  { id: 'fagge', name: 'Fagge Market Center', x: 280, y: 110, hue: 'text-blue-500' },
  { id: 'gwale', name: 'Gwale Trade Depot', x: 120, y: 220, hue: 'text-green-500' },
  { id: 'nassarawa', name: 'Nassarawa Grain Hub', x: 320, y: 260, hue: 'text-purple-500' },
  { id: 'tarauni', name: 'Tarauni Hub', x: 220, y: 310, hue: 'text-yellow-500' },
];

const PRESET_ROUTES = [
  {
    id: 'route-1',
    name: 'Kwari Market Bulk Delivery',
    origin: 'Dala Logistics Hub',
    destination: 'Fagge Market Center',
    path: [{ x: 80, y: 80 }, { x: 180, y: 85 }, { x: 280, y: 110 }],
    distance: '6.4 km',
    standardTime: '28 min',
    smartTime: '16 min',
    savedTime: '43%',
    vehicle: 'Electric Last-Mile Van',
    weight: '850 kg',
  },
  {
    id: 'route-2',
    name: 'South-East Agro Supply Line',
    origin: 'Nassarawa Grain Hub',
    destination: 'Gwale Trade Depot',
    path: [{ x: 320, y: 260 }, { x: 250, y: 280 }, { x: 150, y: 260 }, { x: 120, y: 220 }],
    distance: '11.2 km',
    standardTime: '48 min',
    smartTime: '29 min',
    savedTime: '40%',
    vehicle: 'Heavy Haul Delivery Truck',
    weight: '3,200 kg',
  },
  {
    id: 'route-3',
    name: 'Fagge to Tarauni Express Delivery',
    origin: 'Fagge Market Center',
    destination: 'Tarauni Hub',
    path: [{ x: 280, y: 110 }, { x: 260, y: 200 }, { x: 220, y: 310 }],
    distance: '4.8 km',
    standardTime: '22 min',
    smartTime: '13 min',
    savedTime: '41%',
    vehicle: 'Solar Electric E-Trike',
    weight: '300 kg',
  },
];

export default function TrackerWidget() {
  const [selectedRouteId, setSelectedRouteId] = useState(PRESET_ROUTES[0].id);
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [telemetry, setTelemetry] = useState({ speed: 0, battery: 94, status: 'Pre-dispatch' });
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  
  const currentRoute = PRESET_ROUTES.find(r => r.id === selectedRouteId) || PRESET_ROUTES[0];
  const simulationInterval = useRef<any>(null);

  // Restart tracker simulation when route changes
  useEffect(() => {
    stopSimulation();
  }, [selectedRouteId]);

  const stopSimulation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
    }
    setIsSimulating(false);
    setProgress(0);
    setTelemetry({ speed: 0, battery: 98, status: 'Ready for Dispatch' });
    setSimulationLog([]);
  };

  const startSimulation = () => {
    stopSimulation();
    setIsSimulating(true);
    setProgress(0);
    setTelemetry({ speed: 42, battery: 98, status: 'In Transit' });
    
    setSimulationLog([
      '⚡ AI optimization routine initiated...',
      `✅ Primary route calculated via custom Dala bypass: ${currentRoute.distance}`,
      '🚛 Smart vehicle status checked: All OK',
      '🟢 Vehicle dispatched from origin'
    ]);

    let currentProgress = 0;
    simulationInterval.current = setInterval(() => {
      currentProgress += 2;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(simulationInterval.current);
        setIsSimulating(false);
        setTelemetry({ speed: 0, battery: 92, status: 'Delivered' });
        setSimulationLog(prev => [
          ...prev,
          '🏁 Arrived securely at Destination!',
          '📦 Delivery token confirmed on-ledger.',
          `🕒 Route completed in ${currentRoute.smartTime} (${currentRoute.savedTime} faster)`
        ]);
      } else {
        setProgress(currentProgress);
        
        let subStatus = 'Optimizing traffic paths';
        let currentSpeed = 38 + Math.floor(Math.sin(currentProgress / 10) * 15);
        
        if (currentProgress === 20) {
          setSimulationLog(prev => [...prev, '🚦 Avoiding congestion spot at Sabon Gari junction']);
        } else if (currentProgress === 50) {
          setSimulationLog(prev => [...prev, '⚡ Smart battery conservation mode: Eco-Glide active']);
        } else if (currentProgress === 80) {
          setSimulationLog(prev => [...prev, '🛡️ Approaching delivery zone, transmitting digital authorization key']);
        }

        setTelemetry({
          speed: currentSpeed,
          battery: Math.max(90, 98 - Math.floor(currentProgress * 0.08)),
          status: currentProgress < 95 ? `Transit (${currentProgress}%)` : 'Decelerating'
        });
      }
    }, 120);
  };

  // Calculate current vehicle coordinate on the SVG map based on progress
  const getVehicleCoordinates = () => {
    const pts = currentRoute.path;
    if (pts.length < 2) return { x: 50, y: 50 };
    
    const segmentCount = pts.length - 1;
    const progressPerSegment = 100 / segmentCount;
    
    const segmentIndex = Math.min(
      Math.floor(progress / progressPerSegment),
      segmentCount - 1
    );
    
    const segmentProgress = (progress % progressPerSegment) / progressPerSegment;
    
    const startPt = pts[segmentIndex];
    const endPt = pts[segmentIndex + 1];
    
    return {
      x: startPt.x + (endPt.x - startPt.x) * (isSimulating ? segmentProgress : (progress === 100 ? 1 : 0)),
      y: startPt.y + (endPt.y - startPt.y) * (isSimulating ? segmentProgress : (progress === 100 ? 1 : 0)),
    };
  };

  const vehicleCoords = getVehicleCoordinates();

  return (
    <div id="tracker-widget" className="h-full flex flex-col justify-between text-slate-800 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">
              Telemetry sandbox
            </span>
            <h3 className="text-xl font-bold tracking-tight text-blue-900 mt-1">SmartRoute Optimizer</h3>
          </div>
          <button
            onClick={isSimulating ? stopSimulation : startSimulation}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold tracking-wide transition-colors shadow-sm cursor-pointer"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Reset
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-orange-400" />
                Dispatch
              </>
            )}
          </button>
        </div>

        {/* Route Selector tabs */}
        <div className="grid grid-cols-3 gap-1 mb-4 bg-slate-50 p-1 rounded-xl">
          {PRESET_ROUTES.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRouteId(r.id)}
              className={`py-2 text-[11px] font-medium rounded-lg text-center transition-all cursor-pointer ${
                selectedRouteId === r.id
                  ? 'bg-white text-blue-900 shadow-xs border border-slate-200/50 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r.id === 'route-1' ? 'Kwari Market' : r.id === 'route-2' ? 'Agro Supply' : 'Tarauni Express'}
            </button>
          ))}
        </div>

        {/* Dynamic Schematic Map */}
        <div className="relative h-44 bg-slate-900 rounded-2xl overflow-hidden mb-4 border border-slate-850">
          {/* Custom SVG Drawing Routes & Intersections */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Invariant Roads Grid background */}
            <line x1="30" y1="80" x2="350" y2="80" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="120" y1="30" x2="120" y2="350" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="280" y1="30" x2="280" y2="350" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="30" y1="220" x2="350" y2="220" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

            {/* Non-active alternative connection lines (gray routes) */}
            {PRESET_ROUTES.map(r => (
              <path
                key={`bg-path-${r.id}`}
                d={`M ${r.path.map(p => `${p.x},${p.y}`).join(' L ')}`}
                fill="none"
                stroke="#1e293b"
                strokeWidth="2"
                strokeLinecap="round"
                opacity={r.id === selectedRouteId ? 0.3 : 0.15}
              />
            ))}

            {/* Active Highlighted Route Path */}
            <path
              id="active-delivery-route"
              d={`M ${currentRoute.path.map(p => `${p.x},${p.y}`).join(' L ')}`}
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />

            {/* Moving Tracker dash line showing optimized delivery */}
            <path
              d={`M ${currentRoute.path.map(p => `${p.x},${p.y}`).join(' L ')}`}
              fill="none"
              stroke="#ea580c"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8 600"
              strokeDashoffset={-progress * 3.5}
              className="opacity-90"
            />

            {/* Hub node circles */}
            {KANO_HUBS.map(hub => {
              const isOrigin = currentRoute.origin === hub.name;
              const isDest = currentRoute.destination === hub.name;
              const isWaypt = isOrigin || isDest;
              return (
                <g key={hub.id} className="cursor-help group">
                  <circle
                    cx={hub.x}
                    cy={hub.y}
                    r={isWaypt ? 5 : 3.5}
                    fill={isOrigin ? '#ea580c' : isDest ? '#3b82f6' : '#475569'}
                    className={`transition-all duration-300 ${isWaypt ? 'ring-4 ring-offset-2 ring-slate-900 animate-pulse' : ''}`}
                  />
                  <text
                    x={hub.x}
                    y={hub.y - 8}
                    textAnchor="middle"
                    className="text-[8px] font-sans font-semibold fill-slate-300 pointer-events-none select-none tracking-tight shadow-sm"
                  >
                    {hub.name.replace(' Hub', '').replace(' Market Center', '').replace(' Trade Depot', '')}
                  </text>
                </g>
              );
            })}

            {/* Blinking animated vehicle tracker pointer */}
            <g
              transform={`translate(${vehicleCoords.x}, ${vehicleCoords.y})`}
              className="transition-transform duration-100 ease-out"
            >
              <circle
                r="10"
                fill="#ea580c"
                className="opacity-30 blur-[2px]"
              />
              <circle r="5" fill="#f97316" />
              <circle r="2" fill="#fff" className="animate-ping" />
            </g>
          </svg>

          {/* Floating real-time stats */}
          <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded text-[9px] font-mono border border-slate-800 text-slate-300 flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            GPS ACTIVE
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex justify-between gap-2.5">
            <div className="bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-mono border border-slate-800 text-slate-200">
              <span className="text-slate-400">Cargo:</span> <span className="font-semibold text-orange-400">{currentRoute.weight}</span>
            </div>
            <div className="bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-mono border border-slate-800 text-slate-200">
              <span className="text-slate-400">Time:</span> <span className="font-semibold text-white">{currentRoute.smartTime}</span> <span className="text-emerald-400">({currentRoute.savedTime} Saved)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry panel */}
      <div className="grid grid-cols-3 gap-2.5 mb-3 bg-slate-50 p-2.5 rounded-2xl">
        <div className="text-center border-r border-slate-100 last:border-r-0">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Velocity</p>
          <span className="text-[15px] font-mono font-black text-blue-950">{telemetry.speed} <span className="text-[10px] font-normal text-slate-500">km/h</span></span>
        </div>
        <div className="text-center border-r border-slate-100 last:border-r-0">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ECO Energy</p>
          <span className="text-[15px] font-mono font-black text-emerald-600">{telemetry.battery}%</span>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Route Grade</p>
          <span className="text-[15px] font-mono font-black text-orange-600">A+ Smart</span>
        </div>
      </div>

      {/* Terminal audit list */}
      <div className="h-[76px] bg-slate-950 rounded-xl p-2.5 overflow-y-auto font-mono text-[9px] leading-relaxed text-slate-300 border border-slate-800/80">
        <div className="text-amber-500 font-bold uppercase tracking-wider text-[8px] mb-1 flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
          Realtime Dispatch Audit Logs
        </div>
        {simulationLog.length === 0 ? (
          <div className="text-slate-500 italic">Pre-dispatch environment active. Click 'Dispatch' button above to audit.</div>
        ) : (
          simulationLog.map((log, index) => (
            <div key={index} className="flex gap-1.5">
              <span className="text-slate-600">[{10 + index}s]</span>
              <span>{log}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
