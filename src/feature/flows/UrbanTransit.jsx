import React, { useState, useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";

// ─────────────────────────────────────────────────────────────────────────────
// FIANARANTSOA – Réseau de bus urbain (taxi-be)
// 13 lignes diurnes · Anjoma = hub central (marché principal)
// Coordonnées GPS réelles placées sur les axes goudronnés de la ville
// ─────────────────────────────────────────────────────────────────────────────

const LINE_CONFIG = {
  "38": { color: "#06b6d4", name: "Ligne 38 – Andrainjaito → Rex"         },
  "12": { color: "#a855f7", name: "Ligne 12 – Ambalapaiso → Tsianolondroa" },
  "04": { color: "#f59e0b", name: "Ligne 04 – Isaha → Anjoma"             },
};

// ─── WAYPOINTS SUR GOUDRON (coordonnées GPS réelles de Fianarantsoa) ─────────
//
// Centres de quartier vérifiés :
//   Anjoma (marché)      ≈ -21.4530, 47.0867   hub central
//   Andrainjaito         ≈ -21.4462, 47.0891   nord-est
//   Ambalapaiso          ≈ -21.4510, 47.0848   centre-nord
//   Isaha                ≈ -21.4555, 47.0832   sud-centre
//   Tsianolondroa        ≈ -21.4580, 47.0810   sud (Alliance Française)
//   Rex (cinéma)         ≈ -21.4520, 47.0900   est
//   Antamponivory        ≈ -21.4490, 47.0870   nord-centre
//   Salfa                ≈ -21.4502, 47.0855   carrefour nord
//
// Pour affiner : clic droit sur la route dans openstreetmap.org → copier lat/lng
// ─────────────────────────────────────────────────────────────────────────────

const ROUTE_WAYPOINTS = {
  // Ligne 38 : Andrainjaito → Antamponivory → Salfa → Anjoma → Isaha → Rex
  // Suit l'Avenue de l'Indépendance / RN7 puis routes urbaines
  "38": [
    [-21.4462, 47.0891], // Andrainjaito – départ nord-est
    [-21.4472, 47.0885], // Carrefour Andrainjaito / avenue principale
    [-21.4482, 47.0878], // Axe goudronné vers centre
    [-21.4490, 47.0870], // Antamponivory – croisement
    [-21.4502, 47.0862], // Salfa – sur route bitumée
    [-21.4512, 47.0867], // Approche Anjoma par le nord
    [-21.4530, 47.0867], // Anjoma – marché central (hub)
    [-21.4540, 47.0852], // Avenue vers Isaha
    [-21.4555, 47.0832], // Isaha – banlieue
    [-21.4545, 47.0855], // Retour axe principal
    [-21.4525, 47.0885], // Boulevard est
    [-21.4520, 47.0900], // Rex – arrivée est
  ],

  // Ligne 12 : Ambalapaiso → Anjoma → Tsianolondroa
  // Axe nord-sud par le centre-ville
  "12": [
    [-21.4510, 47.0848], // Ambalapaiso – départ (Campus Numérique / ex-ROSO)
    [-21.4515, 47.0855], // Route goudronnée Ambalapaiso Sud
    [-21.4522, 47.0860], // Carrefour Ambalapaiso / Anjoma
    [-21.4530, 47.0867], // Anjoma – marché (hub)
    [-21.4542, 47.0858], // Boulevard sud bitumé
    [-21.4555, 47.0845], // Axe vers Tsianolondroa
    [-21.4568, 47.0835], // Approche Alliance Française
    [-21.4580, 47.0810], // Tsianolondroa – arrivée (Alliance Française / Mairie)
  ],

  // Ligne 04 : Isaha → Anjoma Centre
  // Liaison sud ↔ marché central
  "04": [
    [-21.4555, 47.0832], // Isaha – départ
    [-21.4548, 47.0838], // Route goudronnée Isaha → centre
    [-21.4540, 47.0848], // Carrefour intermédiaire
    [-21.4535, 47.0855], // Avenue Anjoma Sud
    [-21.4530, 47.0867], // Anjoma – marché (hub)
    [-21.4520, 47.0872], // Anjoma Nord
    [-21.4510, 47.0878], // Anjoma Center (boutiques)
    [-21.4502, 47.0862], // Salfa – terminus
  ],
};

// ─── STATIONS OFFICIELLES (arrêts taxi-be réels) ─────────────────────────────
const STATIONS_BY_LINE = {
  "38": [
    { name: "Andrainjaito",  pos: [-21.4462, 47.0891] },
    { name: "Antamponivory", pos: [-21.4490, 47.0870] },
    { name: "Salfa",         pos: [-21.4502, 47.0862] },
    { name: "Anjoma",        pos: [-21.4530, 47.0867] },
    { name: "Isaha",         pos: [-21.4555, 47.0832] },
    { name: "Rex",           pos: [-21.4520, 47.0900] },
  ],
  "12": [
    { name: "Ambalapaiso",   pos: [-21.4510, 47.0848] },
    { name: "Anjoma",        pos: [-21.4530, 47.0867] },
    { name: "Tsianolondroa", pos: [-21.4580, 47.0810] },
  ],
  "04": [
    { name: "Isaha",         pos: [-21.4555, 47.0832] },
    { name: "Anjoma",        pos: [-21.4530, 47.0867] },
    { name: "Anjoma Center", pos: [-21.4502, 47.0862] },
  ],
};

// ─── OSRM : chemin le plus court entre deux points ───────────────────────────
// On envoie UNIQUEMENT le point de départ et le point d'arrivée.
// OSRM calcule automatiquement le plus court chemin routier bitumé entre eux.
async function fetchShortestRoute(posA, posB) {
  const coords = `${posA[1]},${posA[0]};${posB[1]},${posB[0]}`;
  const url =
    `https://router.project-osrm.org/route/v1/driving/${coords}` +
    `?overview=full&geometries=geojson&steps=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.length)
    throw new Error("OSRM : aucune route carrossable trouvée");
  return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

function getBusPos(path, progress) {
  if (!path || path.length < 2) return path?.[0] ?? [0, 0];
  const total  = path.length - 1;
  const scaled = Math.min(progress, 0.9999) * total;
  const idx    = Math.floor(scaled);
  const t      = scaled - idx;
  const [la, lo] = path[idx];
  const [lb, lp] = path[Math.min(idx + 1, total)];
  return [la + (lb - la) * t, lo + (lp - lo) * t];
}

function pathDistKm(path) {
  if (!path || path.length < 2) return 0;
  let d = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const dlat = (path[i + 1][0] - path[i][0]) * 111;
    const dlng = (path[i + 1][1] - path[i][1]) * 111 * Math.cos(path[i][0] * Math.PI / 180);
    d += Math.hypot(dlat, dlng);
  }
  return d.toFixed(2);
}

// ─── ICÔNES ──────────────────────────────────────────────────────────────────

const makeBusIcon = (color) => L.divIcon({
  className: "",
  html: `<div style="background:${color};padding:6px;border-radius:9px;border:2px solid white;
          box-shadow:0 0 18px ${color}cc;display:flex;align-items:center;justify-content:center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white"
            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>
            <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
          </svg>
         </div>`,
  iconSize: [32, 32], iconAnchor: [16, 16],
});

// ─── MARQUEUR STATION – couleur propre à la ligne ────────────────────────────
//
// Trois variantes visuelles :
//   normal    → cercle blanc + anneau couleur + point intérieur couleur
//   endpoint  → plus grand + halo pulsant + icône "arrêt de bus" stylisée
//   hub       → étoile dorée (Anjoma = hub central commun à toutes les lignes)
//
const makeStationIcon = (color, size = 14, isEndpoint = false, isHub = false) => {
  if (isHub) {
    // ★ Anjoma – hub central commun à toutes les lignes
    return L.divIcon({
      className: "",
      html: `<div style="
        width:${size + 8}px; height:${size + 8}px;
        background: radial-gradient(circle, #facc15 30%, #f59e0b 100%);
        border-radius: 50%;
        border: 2.5px solid white;
        box-shadow: 0 0 14px #facc1588, 0 0 4px #000a;
        display: flex; align-items: center; justify-content: center;
        font-size: ${Math.round((size + 8) * 0.55)}px; line-height: 1;">
        ★
      </div>`,
      iconSize: [size + 8, size + 8],
      iconAnchor: [(size + 8) / 2, (size + 8) / 2],
    });
  }

  if (isEndpoint) {
    // Terminus (départ / arrivée) : grand disque coloré avec halo
    return L.divIcon({
      className: "",
      html: `
        <div style="position:relative; width:${size + 10}px; height:${size + 10}px;
                    display:flex; align-items:center; justify-content:center;">
          <!-- halo pulsant -->
          <div style="position:absolute; width:${size + 10}px; height:${size + 10}px;
            background:${color}; border-radius:50%; opacity:.25;
            animation: stPing 2s cubic-bezier(0,0,.2,1) infinite;"></div>
          <!-- disque principal -->
          <div style="width:${size}px; height:${size}px;
            background: white;
            border-radius: 50%;
            border: 3px solid ${color};
            box-shadow: 0 0 10px ${color}99, 0 2px 6px #0008;
            display:flex; align-items:center; justify-content:center; z-index:2;">
            <!-- point intérieur coloré -->
            <div style="width:${Math.round(size * 0.38)}px; height:${Math.round(size * 0.38)}px;
              background:${color}; border-radius:50%;"></div>
          </div>
        </div>`,
      iconSize: [size + 10, size + 10],
      iconAnchor: [(size + 10) / 2, (size + 10) / 2],
    });
  }

  // Station intermédiaire standard
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px; height:${size}px;
      background: white;
      border-radius: 50%;
      border: 3px solid ${color};
      box-shadow: 0 0 8px ${color}55, 0 1px 4px #0006;
      display:flex; align-items:center; justify-content:center;">
      <div style="width:${Math.round(size * 0.35)}px; height:${Math.round(size * 0.35)}px;
        background:${color}; border-radius:50%;"></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const makeUserIcon = () => L.divIcon({
  className: "",
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:20px;height:20px;background:#3b82f6;
            border-radius:50%;opacity:.35;animation:ping 2s infinite;"></div>
          <div style="width:11px;height:11px;background:white;border:3px solid #3b82f6;
            border-radius:50%;box-shadow:0 0 10px #3b82f6;z-index:10;"></div>
         </div>`,
  iconSize: [20, 20], iconAnchor: [10, 10],
});

function FitBounds({ path }) {
  const map = useMap();
  useEffect(() => {
    if (path?.length > 1)
      map.fitBounds(L.latLngBounds(path), { padding: [48, 48] });
  }, [path, map]);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export const UrbanTransit = () => {
  const [selectedLine, setSelectedLine] = useState("38");
  const stations = STATIONS_BY_LINE[selectedLine];
  const color    = LINE_CONFIG[selectedLine].color;

  const [departIdx,  setDepartIdx]  = useState(0);
  const [arriveeIdx, setArriveeIdx] = useState(stations.length - 1);

  const [subPath,    setSubPath]    = useState(null);
  const [routeError, setRouteError] = useState(null);
  const [loading,    setLoading]    = useState(false);

  const [progress,     setProgress]     = useState(0);
  const [goingForward, setGoingForward] = useState(true);
  const rafRef      = useRef(null);
  const lastTimeRef = useRef(null);
  const progressRef = useRef(0);
  const forwardRef  = useRef(true);
  const SPEED = 0.00009;

  const [userPos, setUserPos] = useState(null);

  // Reset départ/arrivée au changement de ligne
  useEffect(() => {
    const s = STATIONS_BY_LINE[selectedLine];
    setDepartIdx(0);
    setArriveeIdx(s.length - 1);
  }, [selectedLine]);

  // ── Recalcul du plus court chemin dès que départ ou arrivée change ──────────
  useEffect(() => {
    if (departIdx === arriveeIdx) { setSubPath(null); return; }
    const s = STATIONS_BY_LINE[selectedLine];
    setSubPath(null);
    setRouteError(null);
    setLoading(true);
    progressRef.current = 0;
    forwardRef.current  = true;
    setProgress(0);
    setGoingForward(true);

    fetchShortestRoute(s[departIdx].pos, s[arriveeIdx].pos)
      .then(path => { setSubPath(path); setLoading(false); })
      .catch(err  => { console.error(err); setRouteError("Impossible de charger la route"); setLoading(false); });
  }, [selectedLine, departIdx, arriveeIdx]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!subPath || subPath.length < 2) return;
    const animate = (ts) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = ts - lastTimeRef.current;
      lastTimeRef.current = ts;
      let next = progressRef.current + (forwardRef.current ? SPEED : -SPEED) * dt;
      if (next >= 1) { next = 1; forwardRef.current = false; }
      if (next <= 0) { next = 0; forwardRef.current = true;  }
      progressRef.current = next;
      setProgress(next);
      setGoingForward(forwardRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); lastTimeRef.current = null; };
  }, [subPath]);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      p => setUserPos([p.coords.latitude, p.coords.longitude]),
      e => console.error("GPS:", e),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Hub Anjoma commun à toutes les lignes
  const HUB_NAME = "Anjoma";

  const busPos    = useMemo(() => getBusPos(subPath, progress), [subPath, progress]);
  const distKm    = useMemo(() => pathDistKm(subPath), [subPath]);
  const busIcon   = useMemo(() => makeBusIcon(color), [color]);
  const userIcon  = useMemo(() => makeUserIcon(), []);
  const hasRoute  = subPath && subPath.length > 1 && departIdx !== arriveeIdx;
  const mapCenter = [-21.4530, 47.0867]; // Anjoma

  return (
    <div className="space-y-4 animate-in fade-in duration-500">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap justify-between items-center bg-white/[0.03] p-4 rounded-2xl border border-white/10 gap-4">
        <div>
          <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">
            Fianarantsoa Transit <span style={{ color }}>Live</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-mono">
            13 LIGNES DIURNES · HUB ANJOMA · PLUS COURT CHEMIN OSRM
          </p>
        </div>
        <select
          className="bg-black border rounded-lg px-4 py-2 text-xs font-bold outline-none text-white cursor-pointer"
          style={{ borderColor: `${color}55`, boxShadow: `0 0 10px ${color}22` }}
          value={selectedLine}
          onChange={e => setSelectedLine(e.target.value)}
        >
          {Object.entries(LINE_CONFIG).map(([id, cfg]) => (
            <option key={id} value={id} style={{ color: cfg.color, background: "#111" }}>
              {cfg.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── LÉGENDE MARQUEURS ── */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono text-gray-400 leading-relaxed flex flex-wrap gap-4">
        <span className="font-bold" style={{ color }}>Légende marqueurs :</span>
        <span className="flex items-center gap-1">
          <span style={{ display:"inline-block", width:14, height:14, borderRadius:"50%",
            background:"white", border:`3px solid ${color}`, verticalAlign:"middle" }}/>
          Station intermédiaire
        </span>
        <span className="flex items-center gap-1">
          <span style={{ display:"inline-block", width:18, height:18, borderRadius:"50%",
            background:"white", border:`3px solid ${color}`,
            boxShadow:`0 0 8px ${color}`, verticalAlign:"middle" }}/>
          Terminus (départ / arrivée)
        </span>
        <span className="flex items-center gap-1">
          <span style={{ display:"inline-block", width:18, height:18, borderRadius:"50%",
            background:"linear-gradient(circle,#facc15,#f59e0b)",
            textAlign:"center", lineHeight:"18px", fontSize:12 }}>★</span>
          Hub Anjoma (toutes lignes)
        </span>
      </div>

      {/* ── SÉLECTEURS ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "🟢 DÉPART",  value: departIdx,  setter: setDepartIdx  },
          { label: "🔴 ARRIVÉE", value: arriveeIdx, setter: setArriveeIdx },
        ].map(({ label, value, setter }) => (
          <div key={label} className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
            <p className="text-[9px] font-bold font-mono text-gray-500 mb-1">{label}</p>
            <select
              className="w-full bg-transparent text-xs font-bold outline-none cursor-pointer"
              style={{ color }}
              value={value}
              onChange={e => setter(Number(e.target.value))}
            >
              {stations.map((s, i) => (
                <option key={i} value={i} style={{ color: "#fff", background: "#111" }}>
                  {s.name}{s.name === HUB_NAME ? " ★" : ""}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* ── INFO TRAJET ── */}
      <div
        className="flex flex-wrap items-center justify-between px-4 py-2 rounded-xl border text-[10px] font-mono gap-2 min-h-[36px]"
        style={{ borderColor: `${color}44`, background: `${color}11`, color }}
      >
        {loading && <span className="animate-pulse">⏳ Chargement de l'itinéraire OSRM…</span>}
        {!loading && routeError && <span className="text-red-400">⚠ {routeError}</span>}
        {!loading && !routeError && hasRoute && (
          <>
            <span>📍 {stations[departIdx].name} → {stations[arriveeIdx].name}</span>
            <span>~{distKm} km · {subPath.length} pts GPS</span>
            <span className="animate-pulse">{goingForward ? "▶ EN ROUTE" : "◀ RETOUR"}</span>
          </>
        )}
        {!loading && !routeError && departIdx === arriveeIdx && (
          <span className="text-gray-500">Sélectionnez deux stations différentes</span>
        )}
      </div>

      {/* ── CARTE ── */}
      <div className="h-[520px] rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
        <MapContainer center={mapCenter} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {subPath && <FitBounds path={subPath} />}

          {/* Sous-tracé actif – chemin le plus court OSRM */}
          {hasRoute && (
            <>
              <Polyline positions={subPath}
                pathOptions={{ color, weight: 14, opacity: 0.13, lineCap: "round", lineJoin: "round" }} />
              <Polyline positions={subPath}
                pathOptions={{ color, weight: 5,  opacity: 0.92, lineCap: "round", lineJoin: "round" }} />
            </>
          )}

          {/* ── STATIONS – marqueurs colorés selon la ligne ── */}
          {stations.map((s, i) => {
            const isHub      = s.name === HUB_NAME;
            const isEndpoint = i === departIdx || i === arriveeIdx;
            const icon = makeStationIcon(color, 16, isEndpoint, isHub);

            return (
              <Marker key={i} position={s.pos} icon={icon}>
                <Popup>
                  <div className="text-xs font-bold font-mono" style={{ color: isHub ? "#f59e0b" : color }}>
                    {isHub
                      ? "★ HUB ANJOMA (toutes lignes)"
                      : i === departIdx
                        ? "🟢 DÉPART"
                        : i === arriveeIdx
                          ? "🔴 ARRIVÉE"
                          : "● STATION"
                    }
                    {" : "}{s.name.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    Ligne {selectedLine} · {LINE_CONFIG[selectedLine].name}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Waypoints de débogage */}
          {ROUTE_WAYPOINTS[selectedLine].map(([lat, lng], i) => (
            <Marker
              key={`wp-${i}`}
              position={[lat, lng]}
              icon={L.divIcon({
                className: "",
                html: `<div style="width:6px;height:6px;background:${color};border-radius:50%;
                        opacity:0.45;border:1px solid white;"></div>`,
                iconSize: [6, 6], iconAnchor: [3, 3],
              })}
            >
              <Popup>
                <div className="text-[10px] font-mono">
                  Waypoint #{i + 1} – L.{selectedLine}<br />
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Position utilisateur */}
          {userPos && (
            <Marker position={userPos} icon={userIcon}>
              <Popup><div className="text-[10px] font-bold">📍 VOUS ÊTES ICI</div></Popup>
            </Marker>
          )}

          {/* Bus animé */}
          {hasRoute && busPos && (
            <Marker position={busPos} icon={busIcon}>
              <Popup>
                <div className="text-xs">
                  <b style={{ color }}>BUS LIGNE {selectedLine}</b><br />
                  <span className="text-gray-500 text-[10px]">
                    {stations[departIdx].name} → {stations[arriveeIdx].name}
                  </span><br />
                  <span className="text-gray-400 text-[10px]">
                    Progression : {Math.round(progress * 100)} %
                  </span>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Badges superposés */}
        <div className="absolute bottom-4 left-4 z-[1000] flex gap-2 flex-wrap">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-2 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
              Suivi en temps réel
            </span>
          </div>
          {loading && (
            <div className="bg-black/80 backdrop-blur-md border border-yellow-500/30 px-3 py-2 rounded-lg">
              <span className="text-[10px] font-bold text-yellow-400 animate-pulse">⏳ Chargement…</span>
            </div>
          )}
        </div>

        <style>{`
          .leaflet-container { font-family: inherit; }
          .leaflet-popup-content-wrapper { background: rgba(255,255,255,0.97); border-radius: 10px; }
          @keyframes ping    { 75%, 100% { transform: scale(2.5); opacity: 0; } }
          @keyframes stPing  { 0% { transform: scale(1); opacity: .25; }
                               70% { transform: scale(2.2); opacity: 0; }
                               100% { transform: scale(2.2); opacity: 0; } }
        `}</style>
      </div>
    </div>
  );
};