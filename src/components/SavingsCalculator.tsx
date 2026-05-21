import React, { useState } from 'react';
import { Truck, CheckCircle2, TrendingDown, DollarSign } from 'lucide-react';

const CORRIDORS = [
  { id: 'kwari', name: 'Kantin Kwari Textile Row', baseSavings: 0.32, distance: 8, complexity: 'Extreme congestion' },
  { id: 'dala', name: 'Dala Dry Port Direct', baseSavings: 0.28, distance: 15, complexity: 'Heavy cargo limits' },
  { id: 'border', name: 'Cross-Border Sahel Corridors', baseSavings: 0.35, distance: 120, complexity: 'Checkpoints & customs' },
];

export default function SavingsCalculator() {
  const [tonnage, setTonnage] = useState(15);
  const [selectedCorridorId, setSelectedCorridorId] = useState('kwari');

  const corridor = CORRIDORS.find(c => c.id === selectedCorridorId) || CORRIDORS[0];

  // Calculate dynamic outputs
  const calculatedSavings = Math.floor(tonnage * corridor.baseSavings * 18000); 
  const co2OffsetKg = Math.floor(tonnage * corridor.baseSavings * 42);
  const stopsSaved = Math.max(1, Math.floor(tonnage * 0.4));

  return (
    <div className="h-full flex flex-col justify-between" id="savings-calculator">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-widest text-[#1e3a8a] uppercase bg-blue-100/70 px-2.5 py-0.5 rounded-full">
            Cost & CO2 Estimator
          </span>
          <span className="text-xs font-mono font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">Smart-Calc</span>
        </div>
        <h4 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">Savings Estimator</h4>
        <p className="text-[11px] text-slate-500 mb-3">Model your route footprint dynamically for Northern Nigeria.</p>

        {/* Trade Corridor Dropdown */}
        <div className="mb-3">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Freight Corridor
          </label>
          <select
            value={selectedCorridorId}
            onChange={(e) => setSelectedCorridorId(e.target.value)}
            className="w-full text-[12px] py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-blue-900 focus:outline-none"
          >
            {CORRIDORS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Tonnage Slider */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-1">
            <span className="uppercase font-bold tracking-wider text-slate-400">Monthly Freight</span>
            <span className="text-blue-950 font-bold">{tonnage} metric tons</span>
          </div>
          <input
            type="range"
            min="2"
            max="120"
            value={tonnage}
            onChange={(e) => setTonnage(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>
      </div>

      {/* Dynamic Saving Metrics */}
      <div className="space-y-2 mt-auto">
        <div className="bg-gradient-to-r from-blue-50 to-orange-50/40 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Est. Monthly Savings</p>
              <p className="text-[13px] font-extrabold text-blue-950">
                ₦{calculatedSavings.toLocaleString('en-NG')}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
            -{(corridor.baseSavings * 100).toFixed(0)}% Expenses
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
            <p className="text-[8px] font-bold text-slate-400 uppercase">CO₂ Offset</p>
            <p className="text-xs font-bold text-emerald-600 font-mono mt-0.5">-{co2OffsetKg} kg</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
            <p className="text-[8px] font-bold text-slate-400 uppercase">Dispatcher Overlaps</p>
            <p className="text-xs font-bold text-blue-900 font-mono mt-0.5">{stopsSaved} Avoided</p>
          </div>
        </div>
      </div>
    </div>
  );
}
