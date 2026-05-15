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
  
  // État des cartes : false = recto, true = verso
  const [flippedCards, setFlippedCards] = useState({
    card0: false,
    card1: false,
    card2: false,
    card3: false
  });
  
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
          systemHealth: { status: 'healthy', uptime: 86400, memory: 128 }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    await generateReport(data);
    setTimeout(() => setGeneratingReport(false), 1500);
  };

  // Toggle au clic
  const toggleCard = (cardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const statCards = [
    { 
      id: 'card0',
      icon: Zap, 
      label: 'LATENCE', 
      value: wsData?.latency || data?.stats?.speed || '0.2ms', 
      color: 'cyan', 
      unit: 'ms',
      backInfo: 'Optimisation des temps de réponse ⚡'
    },
    { 
      id: 'card1',
      icon: Shield, 
      label: 'DISPONIBILITÉ', 
      value: data?.stats?.availability || '100%', 
      color: 'green', 
      unit: '',
      backInfo: 'Service 24/7 garanti 🛡️'
    },
    { 
      id: 'card2',
      icon: Trophy, 
      label: 'RANG MONDIAL', 
      value: data?.stats?.rank || '#1', 
      color: 'yellow', 
      unit: '',
      backInfo: 'Top performer mondial 🏆'
    },
    { 
      id: 'card3',
      icon: Users, 
      label: 'FORCE ÉQUIPE', 
      value: '4', 
      color: 'purple', 
      unit: '',
      backInfo: '4 guerriers dédiés 👥'
    },
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
                Fianara Smart City
              </motion.h1>
              <div className="text-gray-400 text-sm flex items-center gap-2 flex-wrap">
                <span>Bienvenue, {user?.email?.split('@')[0] || 'Champion'}</span>
                <WebSocketStatus connected={wsConnected} />
              </div>
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
              
              
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Cartes avec flip au clic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const isFlipped = flippedCards[stat.id];
            
            return (
              <div
                key={stat.id}
                className="relative w-full h-48 cursor-pointer perspective-1000"
                onClick={() => toggleCard(stat.id)}
              >
                <motion.div
                  className="relative w-full h-full transition-all duration-500 preserve-3d"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.4, type: "tween" }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Face avant - Recto */}
                  <div 
                    className="absolute w-full h-full backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <GlassCard className="p-5 h-full">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/5`}>
                          <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                        </div>
                        <div className="text-xs text-gray-500 font-mono">CLIC</div>
                      </div>
                      <p className="text-gray-400 text-sm mt-4 font-mono tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mt-1 tracking-tight">
                        {stat.value}{stat.unit}
                      </p>
                      <Sparkles className="absolute bottom-4 right-4 w-4 h-4 text-cyan-400/50" />
                    </GlassCard>
                  </div>
                  
                  {/* Face arrière - Verso */}
                  <div 
                    className="absolute w-full h-full backface-hidden"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <GlassCard className="p-5 h-full">
                      <div className="flex flex-col justify-center h-full text-center">
                        <p className="text-cyan-400 text-sm font-mono mb-2">📌 INFO</p>
                        <p className="text-gray-300 text-sm">{stat.backInfo}</p>
                        <div className="mt-3 w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent mx-auto" />
                        <p className="text-gray-500 text-xs mt-3 font-mono">↺ CLIC POUR RETOURNER</p>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
        
        {/* Activité récente et état système */}
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
        
        {/* Bannière de statut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600/20 via-purple-600/20 to-cyan-600/20 border border-cyan-500/30 p-6"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10" />
          
        </motion.div>
      </div>
    </div>
  );
};