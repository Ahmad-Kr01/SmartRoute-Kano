import React, { useState } from 'react';
import { Play, Copy, Check, Terminal, Code } from 'lucide-react';

const API_ENDPOINTS = [
  {
    tab: 'Optimize',
    method: 'POST',
    path: '/v1/routes/optimize',
    description: 'Calculate fastest last-mile corridor avoiding Kano peak-hour traffic jams.',
    payload: `{
  "origin": "Dala_Dry_Port",
  "destination": "Kantin_Kwari_Textiles",
  "constraints": {
    "avoid_sabon_gari": true,
    "max_weight_kg": 1500
  }
}`,
    response: `{
  "optimized_route_id": "srk_opt_9422",
  "est_distance_km": 7.2,
  "savings_percent": 34.6,
  "eta_minutes": 18,
  "best_vehicle": "Solar_Electric_Van"
}`
  },
  {
    tab: 'Instant Dispatch',
    method: 'POST',
    path: '/v1/dispatch/book',
    description: 'Autonomic vehicle dispatch with high contrast real-time SMS webhook trigger.',
    payload: `{
  "shipper_id": "usr_904",
  "corridor_id": "route_dala_fagge",
  "fuel_type": "electric_trike",
  "auto_cluster": true
}`,
    response: `{
  "dispatch_status": "queued",
  "assigned_vehicle_id": "et_kano_402",
  "driver_phone": "+234 803 000 0000",
  "waybill_hash": "0x3ab8...f229"
}`
  }
];

export default function ApiSnippet() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const endpoint = API_ENDPOINTS[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(endpoint.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col justify-between" id="api-snippet-sandbox">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-900 font-bold uppercase">
            <Code className="w-3.5 h-3.5 text-orange-500" />
            Developer-Ready Integrations
          </div>
          <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-black">GET/POST</span>
        </div>
        <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-none mb-1">Developer Sandbox</h4>
        <p className="text-[10px] text-slate-400 mb-2.5">Toggle and simulate raw REST endpoint inputs below.</p>

        {/* Endpoint Selector Tabs */}
        <div className="flex border-b border-slate-100 gap-1.5 mb-2">
          {API_ENDPOINTS.map((ep, i) => (
            <button
              key={ep.tab}
              onClick={() => {
                setActiveTab(i);
                setShowResponse(false);
              }}
              className={`pb-1 text-[11px] font-semibold transition-colors relative cursor-pointer ${
                activeTab === i ? 'text-blue-900 border-b-2 border-orange-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {ep.tab}
            </button>
          ))}
        </div>

        <p className="text-[9px] text-slate-500 mb-2 font-mono leading-snug">{endpoint.description}</p>

        {/* Payload / Response Code Block */}
        <div className="relative bg-slate-900 rounded-lg p-2.5 font-mono text-[9.5px] leading-tight text-slate-200 mt-1.5 select-text overflow-x-auto border border-slate-800 max-h-36 overflow-y-auto">
          <div className="flex justify-between items-center text-[8px] text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1 mb-1.5">
            <span>{endpoint.method} HTTP <span className="text-orange-500">{endpoint.path}</span></span>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopy}
                className="hover:text-slate-300 transition-colors cursor-pointer"
                title="Copy code payload"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <pre className="text-indigo-300">
            {showResponse ? endpoint.response : endpoint.payload}
          </pre>
        </div>
      </div>

      <div className="flex gap-2 items-center mt-3 z-10">
        <button
          onClick={() => setShowResponse(!showResponse)}
          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold text-center transition-all flex items-center justify-center gap-1 cursor-pointer"
        >
          <Terminal className="w-3 h-3 text-slate-500" />
          {showResponse ? 'Show Request JSON' : 'Simulate API Call'}
        </button>
      </div>
    </div>
  );
}
