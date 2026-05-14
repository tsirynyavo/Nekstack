import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Shield, Trophy, Users, LogOut, Activity, 
  Cpu, Wifi, Clock, Sparkles, TrendingUp, Download,
  LayoutDashboard, Map, Settings, Info,Bus,ShieldAlert
} from 'lucide-react';

import { Particles3D } from '../components/Particles3D';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { useAuthStore } from '../store';
import { useDynamicTheme } from '../hooks/useDynamicTheme.jsx';
import { generateReport } from '../utils/Generate.js';
import { useOfflineSync, OfflineBanner } from '../hooks/useOfflineSync.jsx';
import { useWebSocket, WebSocketStatus } from '../hooks/useWebSocket.jsx';
import { cache } from '../utils/cache';
import api from '../api';
import { UNSAFE_RemixErrorBoundary } from 'react-router-dom';
// Import du Module C
import { UrbanFlux } from '../feature/flows/UrbanFlux.jsx';
import { UrbanTransit } from '../feature/flows/UrbanTransit.jsx';
import { UrbanSafety } from '../feature/flows/UrbanSafety.jsx';
export const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false); // Mis à false pour éviter l'écran noir immédiat
  const [activeModule, setActiveModule] = useState('overview');
  const [time, setTime] = useState(new Date());
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const { isOnline, showOfflineBanner, pendingCount } = useOfflineSync();
  const { data: wsData, connected: wsConnected } = useWebSocket('ws://localhost:8080');
  const { theme } = useDynamicTheme();

  // Gestion de l'heure
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Chargement des données avec sécurité (Données de secours en cas d'erreur API)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dashboardData = await cache.fetchOrGet(
          'dashboard-data',
          async () => {
            const res = await api.get('/api/dashboard');
            return res.data;
          },
          { ttl: 30000 }
        );
        setData(dashboardData);
      } catch (err) {
        console.warn('Backend non joignable, utilisation des données démo');
        setData({
          stats: { speed: '0.2ms', availability: '100%', rank: '#1', team: 4 },
          recentActivity: [
            { action: '🚀 Mode démo Vanquaire actif', time: 'Maintenant' },
            { action: '🔧 Interface isolée activée', time: 'Il y a 5s' }
          ],
          systemHealth: { status: 'healthy', uptime: 120, memory: 128 }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Raccourcis clavier (Debug)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const stats = cache.getStats();
        alert(`📊 STATS CACHE\n✓ Hits: ${stats.hits}\n✗ Misses: ${stats.misses}\n📈 Hit rate: ${stats.hitRate}`);
      }
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        cache.clear();
        window.location.reload();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    await generateReport(data);
    setTimeout(() => setGeneratingReport(false), 1500);
  };

  // Sous-composant pour la vue des statistiques
  const OverviewStats = () => {
    const statCards = [
      { icon: Zap, label: 'LATENCE', value: wsData?.latency || data?.stats?.speed || '0.2ms', color: 'cyan', unit: 'ms' },
      { icon: Shield, label: 'DISPONIBILITÉ', value: data?.stats?.availability || '100%', color: 'green', unit: '' },
      { icon: Trophy, label: 'RANG MONDIAL', value: data?.stats?.rank || '#1', color: 'yellow', unit: '' },
      { icon: Users, label: 'FORCE ÉQUIPE', value: '4', color: 'purple', unit: '' },
    ];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <GlassCard key={idx} className="p-5">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl bg-white/5`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4 font-mono tracking-wider">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}{stat.unit}</p>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="text-cyan-400" /> ACTIVITÉ RÉCENTE
            </h2>
            <div className="space-y-3">
              {data?.recentActivity?.map((act, i) => (
                <div key={i} className="flex justify-between p-3 bg-white/5 rounded-lg text-sm">
                  <span className="text-gray-300">{act.action}</span>
                  <span className="text-cyan-400 font-mono">{act.time}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Cpu className="text-purple-400" /> ÉTAT SYSTÈME
            </h2>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between p-2 border-b border-white/5">
                <span className="text-gray-500">WebSocket</span>
                <span className={wsConnected ? "text-green-400" : "text-red-400"}>
                  {wsConnected ? "ACTIF" : "OFFLINE"}
                </span>
              </div>
              <div className="flex justify-between p-2 border-b border-white/5">
                <span className="text-gray-500">Mémoire</span>
                <span className="text-white">{data?.systemHealth?.memory || 128} MB</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    );
  };

  if (loading && !data) return <DashboardSkeleton />;

  return (
    <div className="flex min-h-screen bg-[#050505] text-white overflow-hidden">
      <Particles3D />
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-72 border-r border-white/10 bg-black/40 backdrop-blur-2xl z-20 flex flex-col">
        <div className="p-8">
          <motion.h1 
            className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-tighter"
          >
            VANQUAIRE
          </motion.h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveModule('overview')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeModule === 'overview' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:bg-white/5'}`}
          >
            <LayoutDashboard size={20} /> <span className="font-medium">Vue Générale</span>
          </button>

          <button 
            onClick={() => setActiveModule('urbanflux')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${activeModule === 'urbanflux' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-500 hover:bg-white/5'}`}
          >
            <Map size={20} /> <span className="font-medium">Module C : UrbanFlux</span>
          </button>
          <button 
            onClick={() => setActiveModule('urbantransit')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
              activeModule === 'urbantransit' 
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
              : 'text-gray-500 hover:bg-white/5'
            }`}
              >
          <Bus size={20} /> <span className="font-medium">Module C2 : Transit</span>
        </button>
        <button 
            onClick={() => setActiveModule('safety')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
              activeModule === 'safety' 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'text-gray-500 hover:bg-white/5'
            }`}
          >
          <ShieldAlert size={20} /> <span className="font-medium">Module C3 : Sécurité</span>
        </button>
        </nav>

        <div className="p-6 border-t border-white/5">
          <NeonButton onClick={logout} variant="danger" className="py-2">
            <LogOut size={16} /> DÉCONNEXION
          </NeonButton>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header className="p-6 border-b border-white/5 bg-black/20 backdrop-blur-md flex justify-between items-center">
          <div>
            <h2 className="text-sm font-mono text-cyan-400 uppercase tracking-widest">Zone: Arena_01</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <Clock size={12} /> {time.toLocaleTimeString()}
              <WebSocketStatus connected={wsConnected} />
            </div>
          </div>
          
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
          >
            {generatingReport ? "..." : <Download size={14} />} RAPPORT PDF
          </button>
        </header>

        {/* Zone de contenu défilante */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeModule === 'overview' && <OverviewStats />}
          {activeModule === 'urbanflux' && <UrbanFlux />}
          {activeModule === 'urbantransit' && <UrbanTransit />}
          <footer className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">
              Vanquaire System v2.4 // {user?.email} // Status: Champion
            </p>
          </footer>
        </div>
      </main>

      <OfflineBanner show={showOfflineBanner} count={pendingCount} />
    </div>
  );
};