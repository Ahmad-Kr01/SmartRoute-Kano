import React, { useState } from 'react';
import { Route, Play, RefreshCw, Navigation, ShieldCheck, Zap, Layers, ChevronRight, MapPin, Truck, Award, Database, TrendingUp, UserCheck, LogOut, CheckCircle, Smartphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TrackerWidget from './components/TrackerWidget';
import SavingsCalculator from './components/SavingsCalculator';
import ApiSnippet from './components/ApiSnippet';
import BookingModal from './components/BookingModal';
import TrackingDashboard from './components/TrackingDashboard';

interface ClientOrder {
  id: string;
  origin: string;
  dest: string;
  weight: string;
  status: 'In Transit' | 'Delivered' | 'Pending Dispatch';
  eta: string;
  cost: string;
}

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'tracking' | 'portal'>('tracking');
  const [fleetType, setFleetType] = useState<'all' | 'electric' | 'truck'>('all');
  
  // Simulated client data for portal state
  const [clientOrders, setClientOrders] = useState<ClientOrder[]>([
    { id: 'SRK-94032', origin: 'Dala Dry Port', dest: 'Fagge Market Row', weight: '1,450 kg', status: 'In Transit', eta: '12 mins', cost: '₦32,500' },
    { id: 'SRK-94011', origin: 'Nassarawa Grain Hub', dest: 'Tarauni Point', weight: '420 kg', status: 'Delivered', eta: 'Completed', cost: '₦11,200' },
    { id: 'SRK-93984', origin: 'Gwale Trade Zone', dest: 'Dala Hub', weight: '2,100 kg', status: 'Delivered', eta: 'Completed', cost: '₦46,800' },
  ]);

  const [newCarrier, setNewCarrier] = useState({ name: '', phone: '', vehicle: 'E-Tricycle', area: 'Kano Municipal' });
  const [carrierSubmitted, setCarrierSubmitted] = useState(false);

  const handleCarrierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCarrierSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Navigation Bar */}
        <header className="flex justify-between items-center mb-8 bg-white/70 backdrop-blur-md sticky top-4 z-40 px-6 py-4 rounded-3xl border border-slate-100/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-900 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10 transition-transform hover:rotate-12 duration-300">
              <div className="w-4.5 h-4.5 border-2 border-orange-500 rotate-45"></div>
            </div>
            <span className="text-xl font-black tracking-tight text-blue-900 font-display">
              SmartRoute <span className="text-orange-600 font-bold">Kano</span>
            </span>
          </div>

          <nav className="hidden md:flex gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                currentView === 'landing' ? 'bg-blue-900 text-white shadow-xs' : 'hover:bg-slate-100/80 hover:text-slate-800'
              }`}
            >
              Explore Hubs
            </button>
            <button
              onClick={() => setCurrentView('tracking')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                currentView === 'tracking' ? 'bg-blue-900 text-white shadow-xs' : 'hover:bg-slate-100/80 hover:text-slate-800 font-bold'
              }`}
            >
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              Live Tracking Dashboard
            </button>
            <button
              onClick={() => setCurrentView('portal')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                currentView === 'portal' ? 'bg-blue-900 text-white shadow-xs' : 'hover:bg-slate-100/80 hover:text-slate-800'
              }`}
            >
              Merchant Workspace
            </button>
            <button
              onClick={() => setIsJoinOpen(true)}
              className="px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer hover:bg-slate-100/80 hover:text-slate-800"
            >
              Become Carrier
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (currentView === 'portal') {
                  setCurrentView('landing');
                } else {
                  setCurrentView('portal');
                }
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                currentView === 'portal'
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-blue-900 hover:bg-blue-800 text-white shadow-blue-900/10'
              }`}
            >
              {currentView === 'portal' ? (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  Exit Portal
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  Client Portal
                </>
              )}
            </button>
          </div>
        </header>

        {/* Mobile View Roster Selector */}
        <div className="md:hidden flex overflow-x-auto gap-2 pb-4 mb-3 border-b border-slate-200/40 scrollbar-none font-sans">
          <button
            onClick={() => setCurrentView('landing')}
            className={`px-4 py-2 shrink-0 text-xs font-bold rounded-xl ${
              currentView === 'landing' ? 'bg-blue-900 text-white' : 'bg-white text-slate-600 border border-slate-200/60'
            }`}
          >
            Explore Hubs
          </button>
          <button
            onClick={() => setCurrentView('tracking')}
            className={`px-4 py-2 shrink-0 text-xs font-bold rounded-xl flex items-center gap-1.5 ${
              currentView === 'tracking' ? 'bg-blue-900 text-white' : 'bg-white text-slate-600 border border-slate-200/60'
            }`}
          >
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
            Tracker Dashboard
          </button>
          <button
            onClick={() => setCurrentView('portal')}
            className={`px-4 py-2 shrink-0 text-xs font-bold rounded-xl ${
              currentView === 'portal' ? 'bg-blue-900 text-white' : 'bg-white text-slate-600 border border-slate-200/60'
            }`}
          >
            Merchant Portal
          </button>
        </div>

        {/* --- MAIN INTERACTIVE SECTIONS --- */}

        <AnimatePresence mode="wait">
          {currentView === 'portal' ? (
            /* --- RENDER SIMULATED CLIENT PORTAL WORKSPACE --- */
            <motion.div
              key="client-portal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-[32px] p-6 md:p-10 border border-slate-200/60 shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Simulated Workspace</span>
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-blue-950">Grand Palace Merchants Ltd</h2>
                  <p className="text-sm text-slate-500 mt-1">Client ID: SRK-MUNIC-804 &bull; Primary Hub: Kantin Kwari Zone</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-2xl tracking-wide transition-all shadow-md cursor-pointer"
                  >
                    + Book New Dispatch Cargo
                  </button>
                </div>
              </div>

              {/* Portal Fleet Dashboard Stats widgets */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Waybills</p>
                  <p className="text-2xl font-black text-blue-950 mt-1">02 <span className="text-xs font-normal text-slate-500">en route</span></p>
                  <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span>&bull;</span> 34.2 min average transit time
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated Discounts</p>
                  <p className="text-2xl font-black text-orange-600 mt-1">₦184,300</p>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                    <span>&bull;</span> Saved via multi-stop clustering
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Eco Offset Contrib</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">412.5 kg</p>
                  <div className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                    <span>&bull;</span> E-Tricycle logistics utilization
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Safety Score</p>
                  <p className="text-2xl font-black text-blue-900 mt-1">99.8%</p>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                    <span>&bull;</span> Guaranteed dry-cargo ledger
                  </div>
                </div>
              </div>

              {/* Waybills Listing section */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-sm">Waybill Manifest Terminal</h3>
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                    REALTIME LEDGER
                  </span>
                </div>

                <div className="divide-y divide-slate-100 select-text font-sans">
                  {clientOrders.map((order) => (
                    <div key={order.id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-slate-50/50 transition-colors gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">{order.id}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            order.status === 'In Transit' ? 'bg-orange-500/10 text-orange-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap text-slate-500 text-xs gap-x-2 mt-1 font-medium items-center">
                          <span>{order.origin}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400 inline" />
                          <span>{order.dest}</span>
                          <span className="text-slate-300">|</span>
                          <span>Weight: {order.weight}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-x-6 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0 mt-1 sm:mt-0">
                        <div className="text-right sm:text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Estimated Arrival</p>
                          <p className="text-xs font-bold text-slate-700">{order.eta}</p>
                        </div>
                        <div className="text-right sm:text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Freight Fee</p>
                          <p className="text-xs font-black text-blue-950 font-mono">{order.cost}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : currentView === 'tracking' ? (
            <motion.div
              key="tracking-dashboard-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <TrackingDashboard />
            </motion.div>
          ) : (
            /* --- RENDER HIGH-END BENTO GRID LANDING PAGE --- */
            <motion.div
              key="landing-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              {/* 1. Hero Slate (Top-Left 2x2 spans) */}
              <div className="col-span-1 md:col-span-2 md:row-span-2 bg-gradient-to-br from-blue-950 to-blue-900 rounded-[32px] p-8 md:p-10 flex flex-col justify-between text-white relative overflow-hidden shadow-xl border border-blue-950">
                
                {/* Visual Backdrop Sphere */}
                <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-orange-500 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-500 opacity-15 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10">
                  <span className="bg-orange-500/20 text-orange-400 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-orange-500/30 mb-6 inline-block">
                    ⚡ Now Operational in Northern Nigeria
                  </span>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.05] mb-6">
                    The New <br/>Standard in <br/><span className="text-orange-500">Logistics.</span>
                  </h1>
                  <p className="text-blue-100/80 text-sm md:text-base max-w-sm leading-relaxed mb-6">
                    SmartRoute Kano leverages custom pathfinding algorithms to optimize dry-cargo & last-mile delivery across the region's historic mercantile highways.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 py-2 mt-4 relative z-10">
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    className="px-6 py-3.5 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-md text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-orange-100" />
                    Book Instant Cargo
                  </button>
                  <a
                    href="#tracker-widget"
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white font-bold rounded-2xl border border-white/15 text-xs sm:text-sm text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Navigation className="w-4 h-4 text-orange-400" />
                    View Transits
                  </a>
                </div>
              </div>

              {/* 2. Interactive Live Optimization Widget (Top-Right 2x1) */}
              <div className="col-span-1 md:col-span-2 md:row-span-1 bg-white border border-slate-200/50 rounded-[32px] overflow-hidden shadow-xs hover:border-slate-300/80 transition-all duration-300">
                <TrackerWidget />
              </div>

              {/* 3. Cost Savings Metrics Calculator (Center-Right 1x1) */}
              <div className="col-span-1 md:col-span-1 bg-white border border-slate-200/50 rounded-[32px] p-6 flex flex-col justify-between shadow-xs hover:border-orange-200 transition-all duration-300">
                <SavingsCalculator />
              </div>

              {/* 4. Tech / Developer API Integration (Far-Right 1x1) */}
              <div className="col-span-1 md:col-span-1 bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-xs hover:border-slate-300/80 transition-all duration-300">
                <ApiSnippet />
              </div>

              {/* 5. Headquarters / Trust Badges (Bottom-Left 1x1) */}
              <div className="col-span-1 md:col-span-1 bg-slate-900 rounded-[32px] p-6 flex flex-col justify-between text-white shadow-lg relative overflow-hidden border border-slate-950">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-5 rounded-full blur-2xl"></div>
                
                <div className="flex gap-1.5 items-center justify-between">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></div>
                    <div className="w-1.5 h-1.5 bg-orange-500/50 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-orange-500/20 rounded-full"></div>
                  </div>
                  <span className="text-[8px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">HQ STABLE</span>
                </div>

                <div className="my-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-orange-500 mb-3 border border-slate-700/50">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-mono font-bold">Base Location</p>
                  <p className="text-xl font-extrabold tracking-tight text-white mt-1">Kano City</p>
                  <p className="text-xs text-slate-400 mt-0.5">Dala Logistics Hub, Nigeria</p>
                </div>

                <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-2">
                  Serving Kwari, Fagge, & Sabon Gari Merchant Markets.
                </div>
              </div>

              {/* 6. Fleet Capacity / Live Metric Tonnage (Bottom-Mid 1x1) */}
              <div className="col-span-1 md:col-span-1 bg-white border border-slate-200/50 rounded-[32px] p-6 flex flex-col justify-between shadow-xs hover:border-slate-300/80 transition-all duration-300">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono">Live Volume</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">+18% MoM</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Monthly Freight Volume</h4>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-slate-800 font-display">14.6k</span>
                    <span className="text-xs font-bold text-slate-400 uppercase">Metric Tons</span>
                  </div>
                </div>

                {/* Animated progress columns */}
                <div className="flex gap-2.5 h-16 items-end mt-4">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full h-8 bg-blue-100 rounded-lg hover:h-12 transition-all duration-300"></div>
                    <span className="text-[8px] font-mono text-slate-400 mt-1">W1</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full h-11 bg-blue-100/80 rounded-lg hover:h-14 transition-all duration-300"></div>
                    <span className="text-[8px] font-mono text-slate-400 mt-1">W2</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full h-14 bg-blue-100/90 rounded-lg hover:h-16 transition-all duration-300"></div>
                    <span className="text-[8px] font-mono text-slate-400 mt-1">W3</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center animate-pulse">
                    <div className="w-full h-16 bg-gradient-to-t from-blue-950 to-orange-500 rounded-lg"></div>
                    <span className="text-[8px] font-mono text-slate-800 font-black mt-1">W4</span>
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 font-medium text-center border-t border-slate-50 pt-2 mt-1">
                  Average fleet utilization rating: 92.4%
                </div>
              </div>

              {/* 7. Secondary CTA / Fleet Partner Network (Bottom-Right 2x1) */}
              <div className="col-span-1 md:col-span-2 bg-[#eff6ff] rounded-[32px] p-6 md:p-8 flex items-center justify-between border-2 border-white/60 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-lg"></div>
                
                <div className="max-w-[280px]">
                  <span className="text-[9px] bg-blue-200/60 text-blue-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-2 inline-block">
                    Carrier Partnering
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-blue-950 tracking-tight leading-snug">Join the Core Fleet</h3>
                  <p className="text-xs text-blue-900/60 leading-relaxed mt-1">
                    Connect your E-Trike, Delivery Van, or Cargo Hauler to our automated dispatch system to maximize daily profits.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsJoinOpen(true)}
                    className="w-12 h-12 bg-white hover:bg-slate-50 text-blue-900 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer group active:scale-95"
                    title="Register Fleet Carrier"
                  >
                    <ChevronRight className="w-6 h-6 text-orange-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Carrier / Partner registration drawer modal */}
        <AnimatePresence>
          {isJoinOpen && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                      Registration Portal
                    </span>
                    <h3 className="text-xl font-bold text-blue-950 mt-1">Become a Carrier Partner</h3>
                  </div>
                  <button
                    onClick={() => {
                      setIsJoinOpen(false);
                      setCarrierSubmitted(false);
                    }}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {!carrierSubmitted ? (
                  <form onSubmit={handleCarrierSubmit} className="space-y-4">
                    <p className="text-xs text-slate-500">
                      Submit details below. Our field-dispatch coordinators at the Dala Logistic Hub will call you within 24 hours to inspect your vehicle configuration.
                    </p>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        Full Name / Agency Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newCarrier.name}
                        onChange={(e) => setNewCarrier({ ...newCarrier, name: e.target.value })}
                        className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-1 focus:ring-blue-900 focus:outline-none"
                        placeholder="e.g. Aliyu Ibrahim Logistics"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        value={newCarrier.phone}
                        onChange={(e) => setNewCarrier({ ...newCarrier, phone: e.target.value })}
                        className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-1 focus:ring-blue-900 focus:outline-none"
                        placeholder="e.g. +234 803 123 4567"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                          Vehicle Profile
                        </label>
                        <select
                          value={newCarrier.vehicle}
                          onChange={(e) => setNewCarrier({ ...newCarrier, vehicle: e.target.value })}
                          className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
                        >
                          <option value="E-Tricycle">Solar E-Tricycle</option>
                          <option value="Dispatch Van">Compact Delivery Van</option>
                          <option value="Box Truck">Heavy Multi-axle Box Truck</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                          Kano Territory
                        </label>
                        <select
                          value={newCarrier.area}
                          onChange={(e) => setNewCarrier({ ...newCarrier, area: e.target.value })}
                          className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
                        >
                          <option value="Kano Municipal">Kano Municipal</option>
                          <option value="Fagge / Kwari">Fagge / Kwari Market</option>
                          <option value="Dala Area">Dala Dry Port Feeder</option>
                          <option value="Tarauni Outer Ring">Tarauni / Challawa</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-900 hover:bg-blue-850 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-colors mt-2 cursor-pointer"
                    >
                      Process Fleet Application
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-base">Application Registered!</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Thank you **{newCarrier.name}**. We booked the registry record under reference **SRK-CARRIER-{Math.floor(1000 + Math.random() * 9000)}** for route dispatch in **{newCarrier.area}**.
                    </p>
                    <button
                      onClick={() => {
                        setIsJoinOpen(false);
                        setCarrierSubmitted(false);
                      }}
                      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Modal for Booking */}
        <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

        {/* Footer info matching layout */}
        <footer className="mt-12 mb-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 px-4 uppercase tracking-[0.2em] font-bold gap-3 border-t border-slate-200/50 pt-6">
          <span>© 2026 SmartRoute Systems Limited</span>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span className="flex items-center gap-1">
              Infrastructure Status: 
              <span className="text-emerald-500 flex items-center gap-1 lowercase">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                stable
              </span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
