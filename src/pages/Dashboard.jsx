import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Shield, Trophy, Users, LogOut, Activity, 
  Cpu, Wifi, Clock, Sparkles, TrendingUp, Download
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

export const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const { isOnline, showOfflineBanner, pendingCount } = useOfflineSync();
  const { data: wsData, connected: wsConnected } = useWebSocket('ws://localhost:8080');
  const { theme } = useDynamicTheme();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
        console.error('Erreur chargement:', err);
        setData({
          stats: { speed: '0.2ms', availability: '100%', rank: '#1', team: 4 },
          recentActivity: [
            { action: '🚀 Mode démo actif', time: 'Maintenant' },
            { action: '💾 Cache utilisé', time: 'Il y a 5s' }
          ],
          systemHealth: { status: 'healthy', uptime: 120, memory: 128 }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const stats = cache.getStats();
        alert(`📊 STATS CACHE\n✓ Hits: ${stats.hits}\n✗ Misses: ${stats.misses}\n📈 Hit rate: ${stats.hitRate}\n💾 Taille: ${stats.size}`);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        console.log('%c🔧 DEBUG MODE', 'color: cyan; font-size: 16px');
        console.log('Cache stats:', cache.getStats());
        console.log('Online status:', isOnline);
        console.log('WebSocket connected:', wsConnected);
        console.log('Theme:', theme);
        console.log('User:', user);
      }
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        cache.clear();
        window.location.reload();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOnline, wsConnected, theme, user]);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    await generateReport(data);
    setTimeout(() => setGeneratingReport(false), 1500);
  };

  const statCards = [
    { icon: Zap, label: 'LATENCE', value: wsData?.latency || data?.stats?.speed || '0.2ms', color: 'cyan', unit: 'ms' },
    { icon: Shield, label: 'DISPONIBILITÉ', value: data?.stats?.availability || '100%', color: 'green', unit: '' },
    { icon: Trophy, label: 'RANG MONDIAL', value: data?.stats?.rank || '#1', color: 'yellow', unit: '' },
    { icon: Users, label: 'FORCE ÉQUIPE', value: '4', color: 'purple', unit: '' },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Particles3D />
      <div className="fixed inset-0 bg-cyber-grid bg-grid pointer-events-none" />
      
      <OfflineBanner show={showOfflineBanner} count={pendingCount} />
      
      <div className="relative z-10 bg-gradient-to-r from-cyan-950/20 via-black/80 to-purple-950/20 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-glow"
              >
                VANQUAIRE ARENA
              </motion.h1>
              <p className="text-gray-400 text-sm flex items-center gap-2 flex-wrap">
                <span>Bienvenue, {user?.email?.split('@')[0] || 'Champion'}</span>
                <WebSocketStatus connected={wsConnected} />
                {!isOnline && <span className="text-yellow-400 text-xs">⚠️ MODE OFFLINE</span>}
                {theme && <span className="text-purple-400 text-xs">🎨 {theme}</span>}
              </p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="glass-white rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-cyan-400 animate-pulse" />
                  <p className="text-cyan-400 font-mono text-xl tracking-wider">{time.toLocaleTimeString()}</p>
                </div>
                <p className="text-gray-500 text-xs text-center">{time.toLocaleDateString('fr-FR')}</p>
              </div>
              
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 px-4 py-2 rounded-xl transition-all text-white text-sm font-medium disabled:opacity-50"
              >
                {generatingReport ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {generatingReport ? 'GÉNÉRATION...' : 'RAPPORT'}
              </button>
              
              <NeonButton onClick={logout} variant="danger" className="!w-auto px-5 py-2 text-sm">
                <LogOut size={16} />
                QUITTER
              </NeonButton>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/5`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  {wsData?.cpu && stat.color === 'cyan' && (
                    <div className="text-xs text-cyan-400 font-mono bg-black/30 px-2 py-1 rounded">
                      {wsData.cpu.toFixed(0)}% CPU
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-4 font-mono tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1 tracking-tight">
                  {stat.value}{stat.unit}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-cyan-400 w-5 h-5" />
              <h2 className="text-lg font-bold text-white">ACTIVITÉ RÉCENTE</h2>
              <div className="flex-1" />
              <span className="text-xs text-cyan-400 font-mono">LIVE</span>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            
            <div className="space-y-3">
              {data?.recentActivity?.map((activity, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex justify-between items-center p-3 bg-gray-800/20 rounded-xl border border-gray-800 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-150 transition-transform" />
                    <span className="text-gray-300 text-sm">{activity.action}</span>
                  </div>
                  <span className="text-cyan-400 text-xs font-mono">{activity.time}</span>
                </motion.div>
              ))}
              {(!data?.recentActivity || data.recentActivity.length === 0) && (
                <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
              )}
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="text-purple-400 w-5 h-5" />
              <h2 className="text-lg font-bold text-white">ÉTAT SYSTÈME</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
                <span className="text-gray-400 flex items-center gap-2">
                  <Wifi size={14} className="text-cyan-400" />
                  Statut API
                </span>
                <span className="text-green-400 font-mono text-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
                <span className="text-gray-400 flex items-center gap-2">
                  <Activity size={14} className="text-cyan-400" />
                  WebSocket
                </span>
                <span className={`font-mono text-sm flex items-center gap-1 ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  {wsConnected ? 'CONNECTÉ' : 'DÉCONNECTÉ'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
                <span className="text-gray-400">Uptime serveur</span>
                <span className="text-white font-mono text-sm">
                  {Math.floor((data?.systemHealth?.uptime || 86400) / 3600)}h {Math.floor(((data?.systemHealth?.uptime || 86400) % 3600) / 60)}m
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
                <span className="text-gray-400">Mémoire utilisée</span>
                <span className="text-white font-mono text-sm">
                  {(data?.systemHealth?.memory || 128).toFixed(0)} MB
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-xl">
                <span className="text-gray-400">Cache hit rate</span>
                <span className="text-cyan-400 font-mono text-sm">
                  {cache.getStats().hitRate}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600/20 via-purple-600/20 to-cyan-600/20 border border-cyan-500/30 p-6 mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10" />
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl animate-bounce">🏆</div>
              <div>
                <p className="text-cyan-400 text-sm font-mono tracking-wider">STATUT ACTUEL</p>
                <p className="text-white text-xl font-bold">CHAMPIONS DU MONDE 2024</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full">
              <TrendingUp size={18} className="text-green-400" />
              <span className="text-green-400 font-mono text-sm font-bold">+100% PERFORMANCE</span>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-8 text-center">
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-500 text-sm flex items-center justify-center gap-3 flex-wrap">
              <span>⚔️ BACKEND EXPERT</span>
              <span className="text-gray-700">✦</span>
              <span>🎨 FRONTEND ULTIME</span>
              <span className="text-gray-700">✦</span>
              <span>🌀 3D MASTER</span>
              <span className="text-gray-700">✦</span>
              <span>📊 DATA VISUALIZATION</span>
            </p>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-600 font-mono">
              <span>⌨️ Ctrl+K → Stats cache</span>
              <span>|</span>
              <span>Ctrl+Shift+D → Debug</span>
              <span>|</span>
              <span>Ctrl+R → Reset cache</span>
            </div>
            <p className="text-gray-700 text-xs mt-3 font-mono">
              VANQUAIRE · 100% SUCCÈS · PRÊT POUR LA VICTOIRE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};