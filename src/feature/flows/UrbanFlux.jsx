import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, MapPin, Search, Layers, Radio, Navigation, Info } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const FIANAR_CENTER = [-21.4536, 47.0854];

// --- Liaison Backend (Simulation) ---
const fetchBinsData = async () => {
  // Remplacez par : const res = await fetch('http://votre-api.com/bins');
  return [
    { id: "BAC-1", location: "Centre-Ville", fill: 88, lat: -21.4536, lng: 47.0854 },
    { id: "BAC-2", location: "Antarandolo",  fill: 22, lat: -21.4471, lng: 47.0901 },
    { id: "BAC-3", location: "Tsianolondroa",fill: 65, lat: -21.4602, lng: 47.0780 },
  ];
};

const statusColor = (fill) => fill >= 80 ? "#ef4444" : fill >= 50 ? "#f59e0b" : "#22d3ee";

const buildIcon = (bac) => {
  const color = statusColor(bac.fill);
  return L.divIcon({
    className: "vq-marker",
    html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="width:35px;height:35px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);box-shadow:0 0 14px ${color};display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);color:#0a0a0a;font-weight:900;font-size:10px;">${bac.fill}%</span>
        </div>
      </div>`,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
  });
};

export const UrbanFlux = () => {
  const [bacs, setBacs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedId, setFocusedId] = useState(null);

  useEffect(() => {
    fetchBinsData().then(data => setBacs(data));
  }, []);

  const filtered = useMemo(() => 
    bacs.filter(b => b.location.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.includes(searchQuery)),
    [bacs, searchQuery]
  );

  return (
    <div className="min-h-screen bg-[#05050a] text-white p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Recherche */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Rechercher un quartier..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-cyan-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {filtered.map(bac => (
              <div 
                key={bac.id}
                onClick={() => setFocusedId(bac.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${focusedId === bac.id ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/[0.03] border-white/5 hover:border-white/10'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-cyan-400">{bac.id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5">{bac.location}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full" style={{ width: `${bac.fill}%`, background: statusColor(bac.fill) }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carte */}
        <div className="lg:col-span-3 rounded-2xl border border-white/10 overflow-hidden relative">
          <MapContainer center={FIANAR_CENTER} zoom={14} style={{ height: "600px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filtered.map(bac => (
              <Marker key={bac.id} position={[bac.lat, bac.lng]} icon={buildIcon(bac)}>
                <Popup>
                  <div className="text-xs font-bold">{bac.location}</div>
                  <div className="text-[10px]">Remplissage: {bac.fill}%</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <style>{`
            .leaflet-container { font-family: inherit; }
                    .lestyleaflet-popup-content-wrapper {
                      background: rgba(255,255,255,0.97);
                      border-radius: 10px;
                    }
                    .vq-marker { background: transparent; border: none; }
            `}</style>
        </div>
      </div>
    </div>
  );
};