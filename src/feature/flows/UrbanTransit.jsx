import React, { useState, useEffect, useMemo } from "react";
import { Bus, MapPin } from "lucide-react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"; //
// Configuration des lignes avec leurs couleurs spécifiques
const LINE_CONFIG = {
  "38": { color: "#06b6d4", name: "Ligne 38 (Andrainjaito - Rex)" },
  "12": { color: "#a855f7", name: "Ligne 12 (Campus - Ville)" },
  "04": { color: "#f59e0b", name: "Ligne 04 (Anosy - Tsianolondroa)" }
};
const ROAD_PATHS = {
  //"38": [
   // [-21.4536, 47.0854], // 1. Andrainjaito (Départ)
   // [-21.4545, 47.0810], // 2. Vers Antanifotsy
   // [-21.4510, 47.0790], // 3. Antamponivory
   // [-21.4485, 47.0785], // 4. Salfa
   // [-21.4460, 47.0765], // 5. Stationnement
   // [-21.4440, 47.0740], // 6. Forêt (Ambalapaiso/Zone boisée)
   // [-21.4430, 47.0725], // 7. Isaha
   // [-21.4425, 47.0710], // 8. Anjoma Center
   // [-21.4420, 47.0700]]  
  // Vous pourrez ajouter les tracés réels pour les lignes 12 et 04 ici
};
const STATIONS = [
  { name: "Andrainjaito", pos: [-21.4536, 47.0854] },
  { name: "Anosy", pos: [-21.4480, 47.0800] },
  { name: "Rex", pos: [-21.4420, 47.0700] }
];

export const UrbanTransit = () => {
  const [selectedLine, setSelectedLine] = useState("38");
  const [busPos, setBusPos] = useState([-21.4536, 47.0854]);
  
  const currentColor = LINE_CONFIG[selectedLine].color;
  const [userPos, setUserPos] = useState(null);
  // Simulation du mouvement fluide


  // --- CORRECTION : Déplacé à l'intérieur du composant ---
  const userIcon = useMemo(() => L.divIcon({
    className: "user-marker",
    html: `<div style="position:relative; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:20px; height:20px; background:#3b82f6; border-radius:50%; opacity:0.4; animation: ping 2s infinite;"></div>
            <div style="width:12px; height:12px; background:white; border:3px solid #3b82f6; border-radius:50%; box-shadow:0 0 10px #3b82f6; z-index:10;"></div>
           </div>`,
    iconSize: [20, 20]
  }), []);

 

  useEffect(() => {
    //affichage de la position de l'utilisateur en temps réel
  if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.error("Erreur GPS:", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.warn("Géolocalisation non supportée");
    }
    const moveBus = setInterval(() => {
      setBusPos(prev => [
        prev[0] + (Math.random() - 0.5) * 0.0004,
        prev[1] + (Math.random() - 0.5) * 0.0004
      ]);
    }, 3000);
    return () => clearInterval(moveBus);
  }, [selectedLine]);

  
  
  // Icône du Bus personnalisée selon la couleur de la ligne
  const busIcon = useMemo(() => L.divIcon({
    className: "bus-live",
    html: `<div style="background:${currentColor}; padding:6px; border-radius:8px; border:2px solid white; box-shadow:0 0 20px ${currentColor}; display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
           </div>`,
    iconSize: [32, 32]
  }), [currentColor]);

  // Icône de Station avec marqueur central de couleur
  const stationIcon = useMemo(() => L.divIcon({
    className: "station-marker",
    html: `<div style="width:16px; height:16px; background:white; border-radius:50%; border:3px solid ${currentColor}; display:flex; align-items:center; justify-content:center;">
            <div style="width:4px; height:4px; background:${currentColor}; border-radius:50%;"></div>
           </div>`,
    iconSize: [16, 16]
  }), [currentColor]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER DE SÉLECTION */}
      <div className="flex flex-wrap justify-between items-center bg-white/[0.03] p-4 rounded-2xl border border-white/10 gap-4">
        <div>
          <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">
            Urban Transit <span style={{ color: currentColor }}>Live</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-mono">STATUT : CONNEXION SATELLITE ÉTABLIE</p>
        </div>
        
        <div className="flex gap-4">
            <select 
              className="bg-black border rounded-lg px-4 py-2 text-xs font-bold outline-none transition-all text-white cursor-pointer"
              style={{ borderColor: `${currentColor}55`, boxShadow: `0 0 10px ${currentColor}22` }}
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
            >
              {Object.entries(LINE_CONFIG).map(([id, config]) => (
                <option key={id} value={id} style={{ color: config.color }}>
                  Ligne {id} — {config.name.split('(')[1].replace(')', '')}
                </option>
              ))}
            </select>
        </div>
      </div>

      {/* CARTE */}
      <div className="h-[550px] rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
        <MapContainer center={STATIONS[0].pos} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
      {ROAD_PATHS[selectedLine] && (
          <Polyline 
            positions={ROAD_PATHS[selectedLine]} 
            pathOptions={{ 
              color: currentColor, // Utilise la couleur de LINE_CONFIG
              weight: 6,           // Épaisseur pour simuler une route
              opacity: 0.7,
              lineJoin: 'round'    // Arrondit les virages pour plus de réalisme
            }} 
          />
        )}
         
       
        
          {/* Marquage des Stations (Couleur adaptée) */}
          {STATIONS.map((s, idx) => (
            <Marker key={idx} position={s.pos} icon={stationIcon}>
              <Popup>
                <div className="text-xs font-bold font-mono">STATION {s.name.toUpperCase()}</div>
              </Popup>
            </Marker>
          ))}

          {userPos && (
              <Marker position={userPos} icon={userIcon}>
                <Popup><div className="text-[10px] font-bold">VOUS ÊTES ICI</div></Popup>
              </Marker>
            )}

          {/* Position du Bus (Couleur adaptée) */}
          <Marker position={busPos} icon={busIcon}>
            <Popup>
              <div className="text-xs">
                <b style={{ color: currentColor }}>BUS LIGNE {selectedLine}</b><br/>
                <span className="text-gray-500">Vitesse: 24 km/h</span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Overlay d'information en bas de carte */}
        <div className="absolute bottom-4 left-4 z-[1000] flex gap-2">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-2 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: currentColor }}></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Suivi en temps réel</span>
          </div>
        </div>

        <style>{`
         ..leaflet-container { font-family: inherit; }
                    .lestyleaflet-popup-content-wrapper {
                      background: rgba(255,255,255,0.97);
                      border-radius: 10px;
                    }
                    .vq-marker { background: transparent; border: none; }
                    @keyframes ping {
                      75%, 100% {
                        transform: scale(2.5);
                        opacity: 0;
                      }
                    }
        `}</style>
      </div>
    </div>
  );
};