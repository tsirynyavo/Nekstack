import React, { useState, useEffect, useMemo } from "react";
import { ShieldAlert, AlertTriangle, Construction, TrafficCone, Send, Bell, CheckCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

// Configuration des types d'incidents
const INCIDENT_TYPES = {
  ACCIDENT: { color: "#ef4444", icon: "🚗", label: "Accident" },
  DEGRADATION: { color: "#f59e0b", icon: "🛠️", label: "Dégradation" },
  BOUCHON: { color: "#ec4899", icon: "🚦", label: "Embouteillage" },
  TRAVAUX: { color: "#3b82f6", icon: "🚧", label: "Travaux" }
};

export const UrbanSafety = () => {
  const [incidents, setIncidents] = useState([
    { id: 1, type: "ACCIDENT", location: "Avenue de l'Indépendance", lat: -21.4536, lng: 47.0854, severity: "High", time: "10 min" },
    { id: 2, type: "BOUCHON", location: "Rond-point Antarandolo", lat: -21.4471, lng: 47.0901, severity: "Medium", time: "5 min" }
  ]);

  const [alertText, setAlertText] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Icône personnalisée pour les incidents
  const createIncidentIcon = (type) => L.divIcon({
    className: "safety-marker",
    html: `<div style="background:${INCIDENT_TYPES[type].color}; width:30px; height:30px; border-radius:50%; border:3px solid white; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow: 0 0 15px ${INCIDENT_TYPES[type].color}aa;">
            ${INCIDENT_TYPES[type].icon}
           </div>`,
    iconSize: [30, 30]
  });

  const handlePublishAlert = () => {
    if (!alertText) return;
    setIsPublishing(true);
    // Simulation d'envoi broadcast
    setTimeout(() => {
      setIsPublishing(false);
      setAlertText("");
      alert("Alerte diffusée à tous les usagers via push notification.");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* SECTION 1: HEADER & BROADCAST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <ShieldAlert className="text-red-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Communication d'Urgence</h2>
              <p className="text-[10px] text-gray-500 font-mono">DIFFUSION INSTANTANÉE AUX USAGERS</p>
            </div>
          </div>
          <div className="relative">
            <textarea 
              value={alertText}
              onChange={(e) => setAlertText(e.target.value)}
              placeholder="Entrez le message d'alerte (ex: Déviation route nationale 7...)"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-red-500 transition-all h-24 resize-none"
            />
            <button 
              onClick={handlePublishAlert}
              disabled={isPublishing}
              className="absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPublishing ? "DIFFUSION..." : <><Send size={14} /> DIFFUSER L'ALERTE</>}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-2xl p-6 flex flex-col justify-center">
          <div className="text-center space-y-2">
            <Bell className="mx-auto text-blue-400 animate-bounce" size={32} />
            <h3 className="text-3xl font-black text-white">1240</h3>
            <p className="text-[10px] text-blue-300 uppercase font-black tracking-widest">Usagers connectés en direct</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: MAP & FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* CARTE DES INCIDENTS */}
        <div className="lg:col-span-3 h-[500px] rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
          <MapContainer center={[-21.4536, 47.0854]} zoom={14} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {incidents.map(inc => (
              <React.Fragment key={inc.id}>
                <Marker position={[inc.lat, inc.lng]} icon={createIncidentIcon(inc.type)}>
                  <Popup>
                    <div className="p-1">
                      <b className="text-black uppercase">{INCIDENT_TYPES[inc.type].label}</b>
                      <p className="text-gray-600 text-xs">{inc.location}</p>
                    </div>
                  </Popup>
                </Marker>
                {inc.severity === "High" && (
                  <Circle 
                    center={[inc.lat, inc.lng]} 
                    radius={300} 
                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1 }} 
                  />
                )}
              </React.Fragment>
            ))}
          </MapContainer>
          <style>{`.leaflet-container { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }`}</style>
        </div>

        {/* FEED DES SIGNALEMENTS */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4">Signalements récents</h3>
          {incidents.map(inc => (
            <div key={inc.id} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black px-2 py-1 rounded" style={{ background: `${INCIDENT_TYPES[inc.type].color}33`, color: INCIDENT_TYPES[inc.type].color }}>
                  {inc.type}
                </span>
                <span className="text-[9px] text-gray-500 font-mono">{inc.time}</span>
              </div>
              <p className="text-sm font-bold text-gray-200 leading-tight">{inc.location}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-green-500/20 text-green-400 text-[9px] font-black py-1 rounded border border-green-500/30 hover:bg-green-500/40">RÉSOLU</button>
                <button className="flex-1 bg-white/5 text-gray-400 text-[9px] font-black py-1 rounded border border-white/10 hover:bg-white/20">DÉTAILS</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};