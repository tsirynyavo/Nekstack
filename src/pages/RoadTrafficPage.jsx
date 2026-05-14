import React, { useState, useEffect } from "react";
import {
  MapPin,
  Trash2,
  AlertTriangle,
  Bus,
  Navigation,
  Send,
  Info,
  CheckCircle2,
  Clock,
  Search,
  Activity,
  ChevronRight,
  Navigation2,
  Filter,
} from "lucide-react";

/**
 * APPLICATION SMARTCITY - MODULE C (Version Cartographique)
 * Simulation de Mobilité et Gestion des Déchets à Fianarantsoa
 * Thème Cyber inspiré du Dashboard VANQUAIRE ARENA
 */

const RoadTrafficPage = () => {
  const [activeTab, setActiveTab] = useState("bus");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Simulation de la position des bus
  const [busPositions, setBusPositions] = useState([
    {
      id: "A",
      x: 220,
      y: 310,
      label: "Ligne A",
      color: "#06b6d4",
      nextStop: "Gare",
      wait: "3 min",
    },
    {
      id: "B",
      x: 550,
      y: 260,
      label: "Ligne B",
      color: "#4f46e5",
      nextStop: "Université",
      wait: "12 min",
    },
    {
      id: "C",
      x: 780,
      y: 340,
      label: "Ligne C",
      color: "#7c3aed",
      nextStop: "Sahambavy",
      wait: "8 min",
    },
  ]);

  // Points de collecte des déchets
  const wasteBins = [
    { id: 1, x: 300, y: 200, level: 85, location: "Quartier Tsianolondroa" },
    { id: 2, x: 450, y: 400, level: 30, location: "Place Anjoma" },
    { id: 3, x: 700, y: 150, level: 60, location: "Antarandolo" },
    { id: 4, x: 150, y: 450, level: 10, location: "Beravina" },
  ];

  // Animation légère des bus pour simuler le mouvement
  useEffect(() => {
    const interval = setInterval(() => {
      setBusPositions((prev) =>
        prev.map((bus) => ({
          ...bus,
          x: bus.x + (Math.random() - 0.5) * 4,
          y: bus.y + (Math.random() - 0.5) * 4,
        })),
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans text-slate-200 flex flex-col relative overflow-hidden">
      {/* GRILLE CYBER EN FOND */}
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
            <Activity size={14} />
            Trafic: Fluide
          </button>
          <button className="p-2 text-slate-500 hover:text-cyan-400 transition-colors">
            <Search size={20} />
          </button>
        </div>
      </header>

      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* NAVIGATION LATERALE */}
        <nav className="lg:col-span-3 space-y-2">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-2">
            Services Urbains
          </p>

          <button
            onClick={() => setActiveTab("bus")}
            className={`w-full flex items-center justify-between px-5 py-5 rounded-[1.5rem] transition-all font-bold ${
              activeTab === "bus"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-4">
              <Bus size={20} />
              <span>Transports Live</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`w-full flex items-center justify-between px-5 py-5 rounded-[1.5rem] transition-all font-bold ${
              activeTab === "map"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-4">
              <Trash2 size={20} />
              <span>Collecte Déchets</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("report")}
            className={`w-full flex items-center justify-between px-5 py-5 rounded-[1.5rem] transition-all font-bold ${
              activeTab === "report"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-4">
              <AlertTriangle size={20} />
              <span>Signaler Incident</span>
            </div>
          </button>

          {/* BLOC AIDE */}
          <div className="mt-8 p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Navigation size={80} className="text-cyan-400" />
            </div>
            <h4 className="font-bold text-sm mb-2 text-slate-400">Aide</h4>
            <p className="text-[11px] text-slate-600">
              Besoin d'assistance ? Contactez le service technique au 321.
            </p>
          </div>
        </nav>

        {/* ZONE DE CONTENU PRINCIPALE */}
        <div className="lg:col-span-9 space-y-6">
          {/* VUE CARTE DES TRANSPORTS */}
          {activeTab === "bus" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Mobilité Live
                  </h2>
                  <p className="text-slate-500 font-bold">
                    Suivi des lignes de bus à Fianarantsoa
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-[10px] font-black text-cyan-400">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    Lignes Actives
                  </div>
                </div>
              </div>

              {/* CARTE DES BUS */}
              <div className="bg-white/[0.03] border border-cyan-500/15 rounded-[2rem] p-4 shadow-xl h-[550px] relative overflow-hidden">
                <div className="absolute inset-4 bg-[#020207] rounded-[1.75rem] overflow-hidden border border-cyan-500/10 shadow-inner">
                  <svg className="w-full h-full" viewBox="0 0 1000 600">
                    {/* Routes */}
                    <path
                      d="M0 300 Q 500 250 1000 350"
                      stroke="#1e293b"
                      strokeWidth="60"
                      fill="none"
                    />
                    <path
                      d="M500 0 L 500 600"
                      stroke="#1e293b"
                      strokeWidth="40"
                      fill="none"
                    />
                    <path
                      d="M200 0 L 800 600"
                      stroke="#1e293b"
                      strokeWidth="20"
                      fill="none"
                    />

                    {/* Lignes cyan de bordure des routes */}
                    <path
                      d="M0 300 Q 500 250 1000 350"
                      stroke="rgba(6,182,212,0.08)"
                      strokeWidth="1"
                      fill="none"
                    />
                    <path
                      d="M500 0 L 500 600"
                      stroke="rgba(6,182,212,0.08)"
                      strokeWidth="1"
                      fill="none"
                    />
                    <path
                      d="M200 0 L 800 600"
                      stroke="rgba(6,182,212,0.06)"
                      strokeWidth="1"
                      fill="none"
                    />

                    {/* Arrêts de référence */}
                    <circle cx="220" cy="310" r="8" fill="#334155" />
                    <circle cx="550" cy="260" r="8" fill="#334155" />
                    <circle cx="780" cy="340" r="8" fill="#334155" />

                    {/* BUS ANIMÉS */}
                    {busPositions.map((bus) => (
                      <g
                        key={bus.id}
                        style={{
                          transition: "all 3s linear",
                          transform: `translate(${bus.x}px, ${bus.y}px)`,
                        }}
                      >
                        {/* Halo */}
                        <circle r="22" fill={bus.color} opacity="0.15" />
                        {/* Corps du bus */}
                        <circle r="12" fill={bus.color} />
                        <text
                          y="4"
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill="white"
                        >
                          {bus.id}
                        </text>

                        {/* Infobulle flottante */}
                        <foreignObject x="15" y="-35" width="125" height="42">
                          <div
                            style={{
                              background: "rgba(10,10,20,0.85)",
                              border: `1px solid ${bus.color}40`,
                              backdropFilter: "blur(8px)",
                              padding: "4px 10px",
                              borderRadius: "10px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "9px",
                                fontWeight: 800,
                                color: "#e2e8f0",
                                margin: 0,
                              }}
                            >
                              {bus.nextStop}
                            </p>
                            <p
                              style={{
                                fontSize: "8px",
                                fontWeight: 700,
                                color: bus.color,
                                margin: 0,
                                letterSpacing: "0.05em",
                              }}
                            >
                              {bus.wait}
                            </p>
                          </div>
                        </foreignObject>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Contrôles de carte */}
                <div className="absolute top-10 right-10 flex flex-col gap-2 z-10">
                  <button className="bg-white/[0.04] border border-cyan-500/20 p-3 rounded-2xl text-slate-500 hover:text-cyan-400 hover:border-cyan-500/40 transition-all">
                    <Navigation2 size={20} />
                  </button>
                  <button className="bg-white/[0.04] border border-cyan-500/20 p-3 rounded-2xl text-slate-500 hover:text-cyan-400 hover:border-cyan-500/40 transition-all">
                    <Filter size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VUE CARTE DES POINTS DE COLLECTE */}
          {activeTab === "map" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Points de Collecte
                  </h2>
                  <p className="text-slate-500 font-bold">
                    État des bacs de recyclage et ordures ménagères
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

              <div className="bg-white/[0.03] border border-cyan-500/15 rounded-[2rem] p-4 shadow-xl h-[550px] relative">
                <div className="absolute inset-4 bg-[#020207] rounded-[1.75rem] overflow-hidden border border-cyan-500/10 shadow-inner">
                  <svg className="w-full h-full" viewBox="0 0 1000 600">
                    <rect width="1000" height="600" fill="#020207" />
                    <path
                      d="M100 100 L 900 100 L 900 500 L 100 500 Z"
                      fill="none"
                      stroke="rgba(6,182,212,0.08)"
                      strokeWidth="1"
                      strokeDasharray="10,10"
                    />

                    {/* Points de collecte (Bacs) */}
                    {wasteBins.map((bin) => (
                      <g
                        key={bin.id}
                        transform={`translate(${bin.x}, ${bin.y})`}
                      >
                        <circle
                          r="30"
                          fill={
                            bin.level > 80
                              ? "#ef4444"
                              : bin.level > 50
                                ? "#f59e0b"
                                : "#10b981"
                          }
                          opacity="0.12"
                        />
                        <circle
                          r="10"
                          fill={
                            bin.level > 80
                              ? "#ef4444"
                              : bin.level > 50
                                ? "#f59e0b"
                                : "#10b981"
                          }
                        />

                        {/* Label Bac */}
                        <foreignObject x="15" y="-10" width="160" height="60">
                          <div>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                color: "#e2e8f0",
                                display: "block",
                              }}
                            >
                              {bin.location}
                            </span>
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 700,
                                color: bin.level > 80 ? "#f87171" : "#64748b",
                                display: "block",
                              }}
                            >
                              Rempli à {bin.level}%
                            </span>
                          </div>
                        </foreignObject>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Légende */}
                <div className="absolute bottom-10 left-10 bg-[#0a0a0f]/90 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/15 space-y-2 z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">
                    Légende
                  </p>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Collecte Urgente</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>À surveiller</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Disponible</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VUE SIGNALEMENT */}
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
                      <div className="bg-white/[0.03] border-2 border-white/[0.08] p-6 rounded-3xl hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all cursor-pointer group">
                        <Trash2
                          className="mb-4 text-slate-600 group-hover:text-cyan-400 transition-colors"
                          size={32}
                        />
                        <span className="font-black text-lg block text-slate-400 group-hover:text-slate-200 transition-colors">
                          Déchets
                        </span>
                      </div>
                      <div className="bg-white/[0.03] border-2 border-white/[0.08] p-6 rounded-3xl hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all cursor-pointer group">
                        <AlertTriangle
                          className="mb-4 text-slate-600 group-hover:text-cyan-400 transition-colors"
                          size={32}
                        />
                        <span className="font-black text-lg block text-slate-400 group-hover:text-slate-200 transition-colors">
                          Trafic
                        </span>
                      </div>
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
                          Soumettre le rapport
                          <Send size={24} />
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
