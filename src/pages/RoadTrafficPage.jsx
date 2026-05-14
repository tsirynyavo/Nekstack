import React, { useState, useEffect, useRef } from "react";
import {
  Trash2,
  AlertTriangle,
  Bus,
  Navigation,
  Send,
  CheckCircle2,
  Search,
  Activity,
  Navigation2,
  Filter,
  MapPin,
  Sparkles,
  X,
  Loader,
  Clock,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

// ─── Fix bug icônes Leaflet avec Vite / CRA ───────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Icône bus personnalisée (thème cyber) ────────────────────────────────────
const createBusIcon = (color, label) =>
  L.divIcon({
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="
          position:absolute;width:44px;height:44px;border-radius:50%;
          background:${color}25;border:1px solid ${color}50;
          top:-8px;left:-8px;
        "></div>
        <div style="
          width:28px;height:28px;border-radius:50%;background:${color};
          border:2px solid ${color}90;display:flex;align-items:center;
          justify-content:center;color:white;font-weight:800;font-size:11px;
          font-family:monospace;position:relative;z-index:1;
          box-shadow:0 0 12px ${color}60;
        ">${label}</div>
      </div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -20],
  });

// ─── Icône position utilisateur ───────────────────────────────────────────────
const createUserIcon = () =>
  L.divIcon({
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="
          position:absolute;width:50px;height:50px;border-radius:50%;
          background:#06b6d425;border:2px solid #06b6d450;
          top:-10px;left:-10px;animation: pulse 2s infinite;
        "></div>
        <div style="
          width:30px;height:30px;border-radius:50%;background:#06b6d4;
          border:2px solid white;display:flex;align-items:center;
          justify-content:center;position:relative;z-index:1;
          box-shadow:0 0 15px #06b6d480;
        ">
          <div style="
            width:8px;height:8px;border-radius:50%;background:white;
          "></div>
        </div>
      </div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });

// ─── Icône arrêt ─────────────────────────────────────────────────────────────
const createStopIcon = () =>
  L.divIcon({
    html: `
      <div style="
        width:12px;height:12px;border-radius:50%;
        background:white;border:2px solid #06b6d4;
        box-shadow:0 0 8px #06b6d480;
      "></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

// ─── Icône bac à ordures ──────────────────────────────────────────────────────
const createBinIcon = (level) => {
  const color = level > 80 ? "#ef4444" : level > 50 ? "#f59e0b" : "#10b981";
  return L.divIcon({
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="
          position:absolute;width:36px;height:36px;border-radius:50%;
          background:${color}20;border:1px solid ${color}50;
          top:-4px;left:-4px;
        "></div>
        <div style="
          width:20px;height:20px;border-radius:50%;background:${color};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 8px ${color}60;position:relative;z-index:1;
        "></div>
      </div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -16],
  });
};

// ─── Coordonnées GPS réelles — Fianarantsoa ───────────────────────────────────
const INITIAL_BUS_POSITIONS = [
  {
    id: "A",
    lat: -21.435,
    lng: 47.082,
    color: "#06b6d4",
    label: "Ligne A",
    nextStop: "Gare",
    wait: "3 min",
    route: [
      [-21.4527, 47.0877],
      [-21.445, 47.085],
      [-21.435, 47.082],
    ],
  },
  {
    id: "B",
    lat: -21.452,
    lng: 47.095,
    color: "#4f46e5",
    label: "Ligne B",
    nextStop: "Université",
    wait: "12 min",
    route: [
      [-21.46, 47.09],
      [-21.456, 47.093],
      [-21.452, 47.095],
    ],
  },
  {
    id: "C",
    lat: -21.468,
    lng: 47.078,
    color: "#7c3aed",
    label: "Ligne C",
    nextStop: "Sahambavy",
    wait: "8 min",
    route: [
      [-21.47, 47.08],
      [-21.469, 47.079],
      [-21.468, 47.078],
    ],
  },
];

const WASTE_BINS = [
  {
    id: 1,
    lat: -21.44,
    lng: 47.083,
    level: 85,
    location: "Quartier Tsianolondroa",
  },
  { id: 2, lat: -21.455, lng: 47.092, level: 30, location: "Place Anjoma" },
  { id: 3, lat: -21.445, lng: 47.1, level: 60, location: "Antarandolo" },
  { id: 4, lat: -21.468, lng: 47.086, level: 10, location: "Beravina" },
];

// ─── Destinations prédéfinies ─────────────────────────────────────────────────
const DESTINATIONS = [
  {
    name: "Gare Centrale",
    lat: -21.435,
    lng: 47.082,
    icon: "🚂",
    line: "A",
  },
  {
    name: "Université",
    lat: -21.46,
    lng: 47.09,
    icon: "🎓",
    line: "B",
  },
  {
    name: "Sahambavy",
    lat: -21.468,
    lng: 47.078,
    icon: "🌿",
    line: "C",
  },
  {
    name: "Place Anjoma",
    lat: -21.455,
    lng: 47.092,
    icon: "🏛️",
    line: "B",
  },
  {
    name: "Antarandolo",
    lat: -21.445,
    lng: 47.1,
    icon: "🏠",
    line: "A",
  },
  {
    name: "Beravina",
    lat: -21.468,
    lng: 47.086,
    icon: "🏘️",
    line: "C",
  },
];

const FIANAR_CENTER = [-21.4527, 47.0877];
const DEFAULT_ZOOM = 13;
const LIGHT_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

// ─── Composant pour centrer la carte ──────────────────────────────────────────
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || DEFAULT_ZOOM);
    }
  }, [center, zoom, map]);
  return null;
};

// ─── Carte des bus ────────────────────────────────────────────────────────────
const BusMap = ({
  busPositions,
  userLocation,
  selectedDestination,
  routeToDestination,
}) => {
  const mapRef = useRef(null);

  return (
    <div className="bg-white/[0.03] border border-cyan-500/15 rounded-[2rem] p-4 shadow-xl h-[550px] relative overflow-hidden">
      <div className="absolute inset-4 rounded-[1.75rem] overflow-hidden border border-cyan-500/10">
        <MapContainer
          center={FIANAR_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
          attributionControl={false}
          ref={mapRef}
        >
          <TileLayer url={LIGHT_TILE_URL} attribution={TILE_ATTRIBUTION} />
          <MapController
            center={
              selectedDestination
                ? [selectedDestination.lat, selectedDestination.lng]
                : FIANAR_CENTER
            }
            zoom={selectedDestination ? 15 : DEFAULT_ZOOM}
          />

          {/* Tracé du trajet */}
          {routeToDestination && (
            <Polyline
              positions={routeToDestination}
              pathOptions={{
                color: "#06b6d4",
                weight: 4,
                opacity: 0.8,
                dashArray: "10, 10",
              }}
            />
          )}

          {/* Position utilisateur */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserIcon()}
            >
              <Popup>
                <div
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    border: "1px solid #06b6d450",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    minWidth: "130px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#1e293b",
                      margin: "0 0 2px",
                    }}
                  >
                    📍 Votre Position
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#64748b",
                      margin: 0,
                    }}
                  >
                    {userLocation.address}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Destination sélectionnée */}
          {selectedDestination && (
            <Marker
              position={[selectedDestination.lat, selectedDestination.lng]}
              icon={createStopIcon()}
            >
              <Popup>
                <div
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    border: "1px solid #06b6d450",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    minWidth: "130px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#1e293b",
                      margin: "0 0 2px",
                    }}
                  >
                    🎯 {selectedDestination.name}
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#64748b",
                      margin: 0,
                    }}
                  >
                    Ligne {selectedDestination.line}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Bus */}
          {busPositions.map((bus) => (
            <Marker
              key={bus.id}
              position={[bus.lat, bus.lng]}
              icon={createBusIcon(bus.color, bus.id)}
            >
              <Popup>
                <div
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    border: `1px solid ${bus.color}50`,
                    borderRadius: "10px",
                    padding: "8px 12px",
                    minWidth: "130px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#1e293b",
                      margin: "0 0 2px",
                    }}
                  >
                    {bus.label}
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#64748b",
                      margin: "0 0 4px",
                    }}
                  >
                    Prochain arrêt :{" "}
                    <span style={{ color: bus.color, fontWeight: 700 }}>
                      {bus.nextStop}
                    </span>
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: bus.color,
                      fontWeight: 700,
                      margin: 0,
                      letterSpacing: "0.05em",
                    }}
                  >
                    ⏱ {bus.wait}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Contrôles superposés */}
      <div className="absolute top-10 right-10 flex flex-col gap-2 z-[400]">
        <button
          onClick={() => mapRef.current?.setView(FIANAR_CENTER, DEFAULT_ZOOM)}
          className="bg-white/90 border border-cyan-200 p-3 rounded-2xl text-slate-600 hover:text-cyan-600 hover:border-cyan-400 transition-all shadow-lg"
          title="Recentrer"
        >
          <Navigation2 size={20} />
        </button>
        <button
          className="bg-white/90 border border-cyan-200 p-3 rounded-2xl text-slate-600 hover:text-cyan-600 hover:border-cyan-400 transition-all shadow-lg"
          title="Filtrer"
        >
          <Filter size={20} />
        </button>
      </div>

      <div className="absolute bottom-6 right-6 z-[400] text-[9px] text-slate-500 font-mono bg-white/80 px-2 py-1 rounded-lg">
        © OSM · CARTO
      </div>
    </div>
  );
};

// ─── Carte des bacs ───────────────────────────────────────────────────────────
const WasteMap = () => (
  <div className="bg-white/[0.03] border border-cyan-500/15 rounded-[2rem] p-4 shadow-xl h-[550px] relative overflow-hidden">
    <div className="absolute inset-4 rounded-[1.75rem] overflow-hidden border border-cyan-500/10">
      <MapContainer
        center={FIANAR_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={LIGHT_TILE_URL} attribution={TILE_ATTRIBUTION} />

        {WASTE_BINS.map((bin) => (
          <Marker
            key={bin.id}
            position={[bin.lat, bin.lng]}
            icon={createBinIcon(bin.level)}
          >
            <Popup>
              <div
                style={{
                  background: "rgba(255,255,255,0.95)",
                  border: `1px solid ${bin.level > 80 ? "#ef444450" : bin.level > 50 ? "#f59e0b50" : "#10b98150"}`,
                  borderRadius: "10px",
                  padding: "8px 12px",
                  minWidth: "150px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#1e293b",
                    margin: "0 0 4px",
                  }}
                >
                  {bin.location}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    margin: 0,
                    color:
                      bin.level > 80
                        ? "#dc2626"
                        : bin.level > 50
                          ? "#d97706"
                          : "#059669",
                  }}
                >
                  Rempli à {bin.level}%
                  {bin.level > 80 ? " — Collecte urgente !" : ""}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>

    {/* Légende */}
    <div className="absolute bottom-10 left-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-cyan-200 shadow-xl space-y-2 z-[1000]">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-2">
        Légende
      </p>
      {[
        { color: "bg-red-500", label: "Collecte Urgente (>80%)" },
        { color: "bg-amber-500", label: "À surveiller (50–80%)" },
        { color: "bg-green-500", label: "Disponible (<50%)" },
      ].map(({ color, label }) => (
        <div
          key={label}
          className="flex items-center gap-3 text-xs font-bold text-slate-700"
        >
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <span>{label}</span>
        </div>
      ))}
    </div>

    <div className="absolute bottom-6 right-6 z-[999] text-[9px] text-slate-500 font-mono bg-white/80 px-2 py-1 rounded-lg">
      © OSM · CARTO
    </div>
  </div>
);

// ─── Zone de recherche intelligente (CORRIGÉE) ───────────────────────────────
const SmartSearch = ({
  onSearch,
  onSelectDestination,
  selectedDestination,
  isLoading,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Suggestions basées sur la saisie
  useEffect(() => {
    if (query.length > 0) {
      const filtered = DESTINATIONS.filter((dest) =>
        dest.name.toLowerCase().includes(query.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  // Gestion clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectDestination = (dest) => {
    setQuery(dest.name);
    onSelectDestination(dest);
    setShowSuggestions(false);
    setIsFocused(false);

    // Ajouter aux recherches récentes
    if (!recentSearches.find((s) => s.name === dest.name)) {
      setRecentSearches((prev) => [dest, ...prev].slice(0, 3));
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setIsFocused(false);
    onSelectDestination(null);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" style={{ zIndex: 9999 }}>
      {/* Barre de recherche principale */}
      <div
        className={`bg-[#0a0a0f]/95 backdrop-blur-xl border rounded-2xl p-4 shadow-2xl transition-all duration-300 ${
          isFocused
            ? "border-cyan-400/50 shadow-cyan-500/20"
            : "border-cyan-500/20"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
              {isLoading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Search size={18} />
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                setIsFocused(true);
                if (query) setShowSuggestions(true);
              }}
              placeholder="Entrez votre position ou destination..."
              className="w-full bg-white/[0.05] border border-cyan-500/20 focus:border-cyan-400/50 rounded-xl py-3.5 pl-12 pr-12 text-sm font-bold text-slate-200 placeholder-slate-600 outline-none transition-all"
              disabled={isLoading}
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 transition-colors p-1"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 text-white p-3.5 rounded-xl font-bold transition-all shadow-lg disabled:cursor-not-allowed hover:shadow-cyan-500/25"
          >
            <Send size={18} />
          </button>
        </div>

        {/* Recherches récentes */}
        {recentSearches.length > 0 && !showSuggestions && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} className="text-cyan-400" />
              Récent:
            </span>
            {recentSearches.map((dest, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectDestination(dest)}
                className="text-[10px] font-bold text-cyan-400/80 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all hover:bg-cyan-500/20"
              >
                {dest.icon} {dest.name}
              </button>
            ))}
          </div>
        )}

        {/* Message d'aide */}
        {!query && !showSuggestions && (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-600">
            <Sparkles size={12} className="text-cyan-400" />
            <span>Essayez "Gare", "Université", "Sahambavy"...</span>
          </div>
        )}
      </div>

      {/* Liste des suggestions - CORRIGÉ avec z-index élevé */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0f]/98 backdrop-blur-xl border border-cyan-400/30 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20"
          style={{ zIndex: 10000 }}
        >
          <div className="p-2">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 py-2 flex items-center gap-2">
              <MapPin size={12} className="text-cyan-400" />
              Destinations trouvées
            </p>
            {suggestions.map((dest, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectDestination(dest)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-cyan-500/10 transition-all group border border-transparent hover:border-cyan-500/20"
              >
                <span className="text-xl">{dest.icon}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">
                    {dest.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                    <Bus size={10} />
                    Ligne {dest.line} • Arrêt de bus
                  </p>
                </div>
                <div className="text-slate-600 group-hover:text-cyan-400 transition-colors">
                  <Navigation2 size={14} className="rotate-90" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message "aucun résultat" */}
      {showSuggestions && suggestions.length === 0 && query.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0f]/98 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden shadow-2xl"
          style={{ zIndex: 10000 }}
        >
          <div className="p-6 text-center">
            <MapPin size={24} className="text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">
              Aucune destination trouvée
            </p>
            <p className="text-[10px] text-slate-600 mt-1">
              Vérifiez l'orthographe ou essayez un autre terme
            </p>
          </div>
        </div>
      )}

      {/* Destination sélectionnée */}
      {selectedDestination && (
        <div className="mt-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4 animate-in backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500/20 p-2.5 rounded-xl border border-cyan-500/30">
                <MapPin size={18} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">
                  Destination sélectionnée
                </p>
                <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span>{selectedDestination.icon}</span>
                  {selectedDestination.name}
                </p>
                <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Bus size={10} />
                  Ligne {selectedDestination.line}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-400/20 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Trajet trouvé
              </span>
              <button
                onClick={handleClear}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
const RoadTrafficPage = () => {
  const [activeTab, setActiveTab] = useState("bus");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [busPositions, setBusPositions] = useState(INITIAL_BUS_POSITIONS);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routeToDestination, setRouteToDestination] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Simulation mouvement GPS des bus
  useEffect(() => {
    const interval = setInterval(() => {
      setBusPositions((prev) =>
        prev.map((bus) => ({
          ...bus,
          lat: bus.lat + (Math.random() - 0.5) * 0.001,
          lng: bus.lng + (Math.random() - 0.5) * 0.001,
        })),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Géolocalisation automatique au chargement
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Position actuelle",
          });
        },
        () => {
          // Position par défaut si refusée
          setUserLocation({
            lat: -21.4527,
            lng: 47.0877,
            address: "Centre-ville Fianarantsoa",
          });
        },
      );
    }
  }, []);

  const handleSearch = async (query) => {
    setIsSearching(true);
    // Simuler une recherche géocodage
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Pour l'exemple, on utilise le centre-ville comme position
    setUserLocation({
      lat: -21.4527,
      lng: 47.0877,
      address: query,
    });
    setIsSearching(false);
  };

  const handleSelectDestination = (dest) => {
    setSelectedDestination(dest);

    // Créer un trajet depuis la position utilisateur
    if (userLocation && dest) {
      const route = [
        [userLocation.lat, userLocation.lng],
        [dest.lat, dest.lng],
      ];
      setRouteToDestination(route);
    }
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const navItems = [
    { id: "bus", icon: Bus, label: "Transports Live" },
    { id: "map", icon: Trash2, label: "Collecte Déchets" },
    { id: "report", icon: AlertTriangle, label: "Signaler Incident" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans text-slate-200 flex flex-col relative overflow-hidden">
      {/* Grille cyber fond */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-[60] bg-[#0a0a0f]/85 backdrop-blur-md border-b border-cyan-500/20 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-cyan-600 to-purple-700 p-2.5 rounded-2xl text-white shadow-lg">
            <Navigation size={22} fill="currentColor" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Fianar Connect
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Réseau Intelligent
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-xs font-bold text-cyan-400">
            <Activity size={14} /> Trafic: Fluide
          </button>
          <button className="p-2 text-slate-500 hover:text-cyan-400 transition-colors">
            <Search size={20} />
          </button>
        </div>
      </header>

      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* NAVIGATION */}
        <nav className="lg:col-span-3 space-y-2">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-2">
            Services Urbains
          </p>
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-4 px-5 py-5 rounded-[1.5rem] transition-all font-bold border ${
                activeTab === id
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                  : "text-slate-500 hover:bg-white/5 hover:text-slate-300 border-transparent"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
          <div className="mt-8 p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Navigation size={80} />
            </div>
            <h4 className="font-bold text-sm mb-2 text-slate-400">Aide</h4>
            <p className="text-[11px] text-slate-600">
              Besoin d'assistance ? Contactez le service technique au 321.
            </p>
          </div>
        </nav>

        {/* CONTENU */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === "bus" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Mobilité Live
                  </h2>
                  <p className="text-slate-500 font-bold">
                    Suivi GPS des lignes de bus à Fianarantsoa
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-[10px] font-black text-cyan-400">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  Lignes Actives
                </div>
              </div>

              {/* Zone de recherche intelligente */}
              <SmartSearch
                onSearch={handleSearch}
                onSelectDestination={handleSelectDestination}
                selectedDestination={selectedDestination}
                isLoading={isSearching}
              />

              {/* Carte avec trajet */}
              <BusMap
                busPositions={busPositions}
                userLocation={userLocation}
                selectedDestination={selectedDestination}
                routeToDestination={routeToDestination}
              />
            </div>
          )}

          {activeTab === "map" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Points de Collecte
                  </h2>
                  <p className="text-slate-500 font-bold">
                    Cliquez sur un point pour les détails
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-orange-400">
                    85%
                  </span>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Remplissage Max
                  </p>
                </div>
              </div>
              <WasteMap />
            </div>
          )}

          {activeTab === "report" && (
            <div className="bg-white/[0.03] border border-cyan-500/15 rounded-[2rem] p-12 shadow-2xl">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-4xl font-black tracking-tighter uppercase bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  Signalement
                </h2>
                <p className="text-slate-500 font-bold mb-10">
                  Aidez-nous à améliorer la ville en signalant un problème.
                </p>

                {showSuccess ? (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-green-400/10 border border-green-400/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-200">
                      Rapport Envoyé !
                    </h3>
                    <p className="text-slate-500 font-medium">
                      Une équipe sera dépêchée sur place prochainement.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReportSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { icon: Trash2, label: "Déchets" },
                        { icon: AlertTriangle, label: "Trafic" },
                      ].map(({ icon: Icon, label }) => (
                        <div
                          key={label}
                          className="bg-white/[0.03] border-2 border-white/[0.08] p-6 rounded-3xl hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all cursor-pointer group"
                        >
                          <Icon
                            className="mb-4 text-slate-600 group-hover:text-cyan-400 transition-colors"
                            size={32}
                          />
                          <span className="font-black text-lg block text-slate-400 group-hover:text-slate-200 transition-colors">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <textarea
                      className="w-full bg-white/[0.03] border-2 border-white/[0.08] focus:border-cyan-500/40 p-8 rounded-[2.5rem] min-h-[150px] outline-none font-bold text-slate-300 placeholder-slate-700 transition-colors resize-none"
                      placeholder="Description de l'incident..."
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Soumettre le rapport <Send size={24} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="relative z-10 mt-auto bg-transparent border-t border-cyan-500/10 py-10 text-center">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">
          Fianarantsoa • Direction Technique Municipale • 2026
        </p>
      </footer>
    </div>
  );
};

export default RoadTrafficPage;
