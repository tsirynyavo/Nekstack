import React, { useState, useEffect, useRef } from "react";
import RoutingMachine from "../components/RoutingMachine";
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
  Plus,
  MousePointerClick,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
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

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const response = await fetch(url);
  const data = await response.json();
  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  }
  return null;
}

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

// ─── Icône pour les points du trajet personnalisé ─────────────────────────────
const createCustomPointIcon = (index) =>
  L.divIcon({
    html: `
      <div style="
        width:12px;height:12px;border-radius:50%;
        background:#f97316;border:2px solid white;
        box-shadow:0 0 8px #f9731680;
        display:flex;align-items:center;justify-content:center;
        font-size:8px;font-weight:bold;color:white;
      ">${index + 1}</div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -8],
  });

// ─── Définition des lignes de bus avec itinéraires réels ─────────────────────
const BUS_LINES = [
  {
    id: "A",
    color: "#06b6d4",
    label: "Ligne A",
    route: [
      [-21.435, 47.082],
      [-21.438, 47.084],
      [-21.442, 47.086],
      [-21.445, 47.085],
      [-21.448, 47.084],
      [-21.4527, 47.0877],
      [-21.455, 47.09],
      [-21.457, 47.093],
      [-21.458, 47.097],
      [-21.46, 47.1],
    ],
  },
  {
    id: "B",
    color: "#4f46e5",
    label: "Ligne B",
    route: [
      [-21.46, 47.09],
      [-21.458, 47.092],
      [-21.456, 47.093],
      [-21.452, 47.095],
      [-21.449, 47.098],
      [-21.446, 47.102],
      [-21.443, 47.105],
    ],
  },
  {
    id: "C",
    color: "#7c3aed",
    label: "Ligne C",
    route: [
      [-21.47, 47.08],
      [-21.469, 47.079],
      [-21.468, 47.078],
      [-21.465, 47.082],
      [-21.462, 47.085],
      [-21.458, 47.088],
      [-21.455, 47.09],
    ],
  },
  {
    id: "40",
    color: "#f59e0b",
    label: "Ligne 40",
    route: [
      [-21.478, 47.065], // Andrainjato
      [-21.472, 47.072],
      [-21.465, 47.078],
      [-21.46, 47.083],
      [-21.4527, 47.0877], // Centre-ville
      [-21.445, 47.093],
      [-21.438, 47.098],
      [-21.432, 47.103],
      [-21.427, 47.108], // Akofafa Ambony
    ],
  },
];

// Positions initiales des bus (sur leur trajet)
const INITIAL_BUS_POSITIONS = BUS_LINES.map((line) => ({
  ...line,
  lat: line.route[0][0],
  lng: line.route[0][1],
  nextStop: "Centre-ville",
  wait: "5 min",
}));

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

const FIANAR_CENTER = [-21.4527, 47.0877];
const DEFAULT_ZOOM = 13;
const LIGHT_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

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

// ─── Composant de capture de clics pour le trajet personnalisé ────────────────
function LocationMarker({ onMapClick, isActive }) {
  useMapEvents({
    click(e) {
      if (!isActive) return; // ne rien faire si le mode n'est pas actif
      const nouvellePosition = [e.latlng.lat, e.latlng.lng];
      onMapClick(nouvellePosition);
    },
  });
  return null;
}

// ─── Carte des bus ────────────────────────────────────────────────────────────
const BusMap = ({
  busPositions,
  userLocation, // gardé pour le marqueur utilisateur
  selectedDestination, // on peut le garder pour l'affichage d'un marqueur spécial
  selectedLine,
  customRoute,
  isAddingRoute,
  onMapClick,
  origin, // nouvelle prop { lat, lng }
  destination,
}) => {
  const mapRef = useRef(null);

  // Préparer les points pour le routage voiture
  const startPoint = userLocation ? [userLocation.lat, userLocation.lng] : null;
  const endPoint = selectedDestination
    ? [selectedDestination.lat, selectedDestination.lng]
    : null;

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

          {/* Itinéraire voiture (remplace la ligne droite) */}
          {origin && destination && (
            <RoutingMachine
              start={[origin.lat, origin.lng]}
              end={[destination.lat, destination.lng]}
            />
          )}

          {/* Tracés des lignes de bus */}
          {BUS_LINES.map((line) => (
            <Polyline
              key={`line-${line.id}`}
              positions={line.route}
              pathOptions={{
                color: line.color,
                weight: 3,
                opacity: 0.4,
                dashArray: line.id === "A" ? "" : "8 8",
              }}
            />
          ))}

          {/* Ligne sélectionnée en surbrillance */}
          {selectedLine && (
            <Polyline
              positions={
                BUS_LINES.find((l) => l.id === selectedLine)?.route || []
              }
              pathOptions={{
                color:
                  BUS_LINES.find((l) => l.id === selectedLine)?.color ||
                  "#f59e0b",
                weight: 6,
                opacity: 0.9,
                dashArray: "4 4",
              }}
            />
          )}

          {/* Trajet personnalisé (orange) */}
          {customRoute.length > 1 && (
            <Polyline
              positions={customRoute}
              pathOptions={{
                color: "#f97316",
                weight: 5,
                opacity: 0.9,
              }}
            />
          )}

          {/* Marqueurs du trajet personnalisé */}
          {customRoute.map((pos, idx) => (
            <Marker
              key={`custom-${idx}`}
              position={pos}
              icon={createCustomPointIcon(idx)}
            >
              <Popup>...</Popup>
            </Marker>
          ))}

          {/* Position utilisateur */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserIcon()}
            >
              <Popup>...</Popup>
            </Marker>
          )}

          {/* Destination sélectionnée */}
          {selectedDestination && (
            <Marker
              position={[selectedDestination.lat, selectedDestination.lng]}
              icon={createStopIcon()}
            >
              <Popup>...</Popup>
            </Marker>
          )}

          {/* Bus en mouvement */}
          {busPositions.map((bus) => (
            <Marker
              key={bus.id}
              position={[bus.lat, bus.lng]}
              icon={createBusIcon(bus.color, bus.id)}
            >
              <Popup>...</Popup>
            </Marker>
          ))}

          <LocationMarker onMapClick={onMapClick} isActive={isAddingRoute} />
        </MapContainer>
      </div>

      {/* Contrôles */}
      {/* … (inchangé) … */}
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

// ─── Zone de recherche intelligente (améliorée) ───────────────────────────────
const SmartSearch = ({ onRoute, isLoading }) => {
  const [departQuery, setDepartQuery] = useState("");
  const [arriveeQuery, setArriveeQuery] = useState("");
  const [origin, setOrigin] = useState(null); // { lat, lng, display_name }
  const [destination, setDestination] = useState(null);
  const [suggestionsDepart, setSuggestionsDepart] = useState([]);
  const [suggestionsArrivee, setSuggestionsArrivee] = useState([]);
  const [showDepSuggestions, setShowDepSuggestions] = useState(false);
  const [showArrSuggestions, setShowArrSuggestions] = useState(false);
  const inputDepartRef = useRef(null);
  const inputArriveeRef = useRef(null);
  const depSuggestionsRef = useRef(null);
  const arrSuggestionsRef = useRef(null);

  // Géocodage à la volée pour suggestions
  const fetchSuggestions = async (query, setSuggestions) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(
      () => fetchSuggestions(departQuery, setSuggestionsDepart),
      500,
    );
    return () => clearTimeout(timer);
  }, [departQuery]);

  useEffect(() => {
    const timer = setTimeout(
      () => fetchSuggestions(arriveeQuery, setSuggestionsArrivee),
      500,
    );
    return () => clearTimeout(timer);
  }, [arriveeQuery]);

  // Clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (
        depSuggestionsRef.current &&
        !depSuggestionsRef.current.contains(e.target) &&
        !inputDepartRef.current.contains(e.target)
      )
        setShowDepSuggestions(false);
      if (
        arrSuggestionsRef.current &&
        !arrSuggestionsRef.current.contains(e.target) &&
        !inputArriveeRef.current.contains(e.target)
      )
        setShowArrSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectDepart = (item) => {
    const loc = {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name,
    };
    setOrigin(loc);
    setDepartQuery(item.display_name);
    setShowDepSuggestions(false);
  };

  const selectArrivee = (item) => {
    const loc = {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name,
    };
    setDestination(loc);
    setArriveeQuery(item.display_name);
    setShowArrSuggestions(false);
  };

  const handleRecherche = () => {
    if (origin && destination) {
      onRoute(origin, destination);
    }
  };

  return (
    <div className="relative" style={{ zIndex: 9999 }}>
      <div className="bg-[#0a0a0f]/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 shadow-2xl">
        <div className="space-y-4">
          {/* Départ */}
          <div className="relative">
            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider mb-1 block">
              Départ
            </label>
            <input
              ref={inputDepartRef}
              type="text"
              value={departQuery}
              onChange={(e) => {
                setDepartQuery(e.target.value);
                setShowDepSuggestions(true);
              }}
              onFocus={() => setShowDepSuggestions(true)}
              placeholder="Votre position ou adresse..."
              className="w-full bg-white/[0.05] border border-cyan-500/20 focus:border-cyan-400/50 rounded-xl py-3 px-4 text-sm font-bold text-slate-200 placeholder-slate-600 outline-none transition-all"
            />
            {showDepSuggestions && suggestionsDepart.length > 0 && (
              <div
                ref={depSuggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0f] border border-cyan-400/30 rounded-xl overflow-hidden shadow-2xl z-[10001]"
              >
                {suggestionsDepart.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectDepart(item)}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-500/10 text-xs text-slate-300"
                  >
                    {item.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Arrivée */}
          <div className="relative">
            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider mb-1 block">
              Arrivée
            </label>
            <input
              ref={inputArriveeRef}
              type="text"
              value={arriveeQuery}
              onChange={(e) => {
                setArriveeQuery(e.target.value);
                setShowArrSuggestions(true);
              }}
              onFocus={() => setShowArrSuggestions(true)}
              placeholder="Destination..."
              className="w-full bg-white/[0.05] border border-cyan-500/20 focus:border-cyan-400/50 rounded-xl py-3 px-4 text-sm font-bold text-slate-200 placeholder-slate-600 outline-none transition-all"
            />
            {showArrSuggestions && suggestionsArrivee.length > 0 && (
              <div
                ref={arrSuggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0f]/98 border border-cyan-400/30 rounded-xl overflow-hidden shadow-2xl z-[10001]"
              >
                {suggestionsArrivee.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectArrivee(item)}
                    className="w-full text-left px-4 py-2 hover:bg-cyan-500/10 text-xs text-slate-300"
                  >
                    {item.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleRecherche}
            disabled={!origin || !destination || isLoading}
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg"
          >
            {isLoading ? (
              <Loader size={18} className="animate-spin mx-auto" />
            ) : (
              "Calculer l'itinéraire voiture"
            )}
          </button>
        </div>
      </div>
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
  const [selectedLine, setSelectedLine] = useState(null);
  const [routeToDestination, setRouteToDestination] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [routeOrigin, setRouteOrigin] = useState(null);
  const [routeDestination, setRouteDestination] = useState(null);

  // Ajoutez ce handler :
  const handleRoute = (origin, destination) => {
    setRouteOrigin(origin);
    setRouteDestination(destination);
  };

  // États pour le trajet personnalisé
  const [customRoute, setCustomRoute] = useState([]);
  const [isAddingRoute, setIsAddingRoute] = useState(false);

  // Simulation mouvement GPS des bus
  useEffect(() => {
    const interval = setInterval(() => {
      setBusPositions((prev) =>
        prev.map((bus) => {
          const line = BUS_LINES.find((l) => l.id === bus.id);
          if (!line) return bus;
          const randomIndex = Math.floor(Math.random() * line.route.length);
          return {
            ...bus,
            lat: line.route[randomIndex][0],
            lng: line.route[randomIndex][1],
          };
        }),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Géolocalisation automatique
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUserLocation({
      lat: -21.4527,
      lng: 47.0877,
      address: query,
    });
    setIsSearching(false);
  };

  const handleSelectDestination = (dest) => {
    setSelectedDestination(dest);
    if (userLocation && dest) {
      setRouteToDestination([
        [userLocation.lat, userLocation.lng],
        [dest.lat, dest.lng],
      ]);
    }
  };

  const handleSelectLine = (lineId) => {
    setSelectedLine(lineId);
  };

  // Ajout d'un point au trajet personnalisé
  const handleMapClick = (coord) => {
    setCustomRoute((prev) => [...prev, coord]);
  };

  // Effacer le trajet personnalisé
  const clearCustomRoute = () => {
    setCustomRoute([]);
    setIsAddingRoute(false);
  };

  const toggleAddingRoute = () => {
    if (isAddingRoute) {
      // Désactiver le mode
      setIsAddingRoute(false);
    } else {
      // Activer le mode
      setIsAddingRoute(true);
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
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

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
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>{" "}
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
        <nav className="lg:col-span-3 space-y-2">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-2">
            Services Urbains
          </p>
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-4 px-5 py-5 rounded-[1.5rem] transition-all font-bold border ${activeTab === id ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : "text-slate-500 hover:bg-white/5 hover:text-slate-300 border-transparent"}`}
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
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>{" "}
                  Lignes Actives
                </div>
              </div>

              <SmartSearch
                onSearch={handleSearch}
                onRoute={handleRoute}
                onSelectDestination={handleSelectDestination}
                onSelectLine={handleSelectLine}
                selectedDestination={selectedDestination}
                selectedLine={selectedLine}
                isLoading={isSearching}
              />

              {/* Barre d'outils pour le trajet personnalisé */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleAddingRoute}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isAddingRoute
                        ? "bg-orange-500/20 border border-orange-400 text-orange-400"
                        : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"
                    }`}
                  >
                    <MousePointerClick size={16} />
                    {isAddingRoute ? "Désactiver" : "Tracer un itinéraire"}
                  </button>
                  {customRoute.length > 0 && (
                    <button
                      onClick={clearCustomRoute}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 border border-red-400/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Effacer le tracé
                    </button>
                  )}
                </div>
                {isAddingRoute && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
                    <Plus size={12} />
                    Cliquez sur la carte pour ajouter des points
                  </div>
                )}
              </div>

              <BusMap
                busPositions={busPositions}
                userLocation={userLocation}
                selectedDestination={selectedDestination}
                routeToDestination={routeToDestination}
                selectedLine={selectedLine}
                customRoute={customRoute}
                isAddingRoute={isAddingRoute}
                onMapClick={handleMapClick}
                origin={routeOrigin}
                destination={routeDestination}
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
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
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
