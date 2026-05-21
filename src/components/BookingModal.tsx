import React, { useState } from 'react';
import { X, CheckCircle, Smartphone, Calendar, Anchor, Package, Send, ShieldCheck, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HUBS = [
  'Dala Logistics Hub',
  'Fagge Market Center',
  'Gwale Trade Depot',
  'Nassarawa Grain Hub',
  'Tarauni Hub'
];

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [origin, setOrigin] = useState(HUBS[0]);
  const [destination, setDestination] = useState(HUBS[1]);
  const [cargoType, setCargoType] = useState('Textiles & Fabrics');
  const [weightKg, setWeightKg] = useState('1200');
  const [contactPhone, setContactPhone] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [waybillNum, setWaybillNum] = useState('');

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const mockHash = 'SRK-' + Math.floor(100000 + Math.random() * 900000);
    setWaybillNum(mockHash);
    setIsBooked(true);
  };

  const handleReset = () => {
    setIsBooked(false);
    setContactPhone('');
    setWeightKg('1200');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex justify-between items-center relative">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400">SmartRoute Kano</span>
            <h3 className="text-xl font-bold tracking-tight">On-Demand Dispatch Sandbox</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {!isBooked ? (
            <form onSubmit={handleBook} className="space-y-4">
              <span className="text-xs text-slate-500 block leading-relaxed">
                Test our active scheduling system. Once your parameter specs are loaded, our simulator will allocate the optimal battery-electric tricycle or freight vehicle from the Dala hub.
              </span>

              {/* Origin and Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Pickup Location
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  >
                    {HUBS.map(hub => (
                      <option key={hub} value={hub}>{hub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Drop-off Target
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  >
                    {HUBS.filter(h => h !== origin).map(hub => (
                      <option key={hub} value={hub}>{hub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cargo category & Tonnage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Commodity Category
                  </label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  >
                    <option value="Textiles & Fabrics">Textiles & Fabrics (Fagge/Kwari)</option>
                    <option value="Agro Grains & Cereals">Agro Grains & Cereals (Nassarawa)</option>
                    <option value="Inland Heavy Machinery">Inland Machinery (Dala Dry Port)</option>
                    <option value="Retail Packaged Goods">Retail Packaged Goods</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Cargo Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="e.g. 500"
                    required
                    min="10"
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Client tracking phone contact */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Recipient WhatsApp / Phone
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +234 803 000 0000"
                  required
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none px-4"
                />
              </div>

              {/* Action */}
              <button
                type="submit"
                className="w-full py-4 text-center text-white bg-orange-500 hover:bg-orange-600 font-bold text-sm tracking-wide rounded-2xl transition-all shadow-md mt-4 cursor-pointer"
              >
                Assemble & Route Dispatch
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 text-center"
            >
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-1 text-emerald-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Dispatch Routing Confirmed!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                SmartRoute Kano's engine matched your ticket with **{Number(weightKg) > 2000 ? 'Heavy Haul delivery fleet' : 'Electric Zero-Emission tricycle'}**.
              </p>

              {/* Waybill digital ticket design */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left font-mono text-xs leading-relaxed max-w-md mx-auto select-all">
                <div className="border-b border-dashed border-slate-300 pb-2.5 mb-2.5 flex justify-between font-bold text-slate-600">
                  <span>SMART_WAYBILL</span>
                  <span className="text-orange-600">{waybillNum}</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-700">
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0">ORIGIN:</span>
                    <span className="font-semibold text-blue-950">{origin}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0">DESTINATION:</span>
                    <span className="font-semibold text-blue-950">{destination}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0">COMMODITY:</span>
                    <span>{cargoType} ({weightKg} kg)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0">NOTIFY NO:</span>
                    <span>{contactPhone}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0">STATUS:</span>
                    <span className="text-emerald-600 font-bold">READY_AT_DALA_DRY_PORT</span>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="mt-4 flex flex-col items-center border-t border-slate-200 pt-3">
                  <div className="h-6 w-44 bg-slate-900 border-x border-slate-900 flex justify-around overflow-hidden mb-1.5">
                    {[3,1,4,2,1,3,2,1,4,3,1,2,2,4,1,3,1,2,3].map((w, idx) => (
                      <div key={idx} style={{ width: `${w * 2.5}px` }} className="h-full bg-white opacity-90 inline-block"></div>
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold tracking-[0.2em]">{waybillNum}</span>
                </div>
              </div>

              <div className="flex gap-3 max-w-md mx-auto pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 text-slate-600 border border-slate-200 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Book Another Cargo
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-white bg-blue-900 hover:bg-blue-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
