import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Shield, Star, Zap } from 'lucide-react';
import { Particles3D } from '../components/Particles3D';
import { GlitchText } from '../components/GlitchText';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { useAuthStore } from '../store';
import api from '../api';

export const Login = () => {
  const [email, setEmail] = useState('admin@vanquaire.com');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/api/login', { email, password });
      login(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Particles3D />
      
      {/* Cyber grid background */}
      <div className="fixed inset-0 bg-cyber-grid bg-grid pointer-events-none" />
      
      {/* Header badge */}
      <div className="relative z-10 pt-8 text-center">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 bg-cyan-500/10 backdrop-blur rounded-full px-5 py-2 border border-cyan-500/30"
        >
          <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-xs font-mono tracking-wider">🏆 CHAMPIONS DU MONDE 2024 🏆</span>
          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
        </motion.div>
      </div>
      
      {/* Login Card */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="w-full max-w-md"
        >
          <GlassCard glow>
            <div className="text-center mb-8">
              {/* Logo animé */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center"
              >
                <span className="text-3xl font-black">V</span>
              </motion.div>
              
              <GlitchText 
                text="VANQUAIRE" 
                className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-glow"
              />
              
              <p className="text-gray-400 mt-3 text-sm tracking-wider">
                ENTER THE CHAMPIONS ARENA
              </p>
              
              <div className="flex justify-center gap-1 mt-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                  />
                ))}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-cyan-400 text-sm mb-2 font-mono tracking-wider">
                  ⚡ IDENTIFIANT
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="votre@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-cyan-400 text-sm mb-2 font-mono tracking-wider">
                  🔐 MOT DE PASSE
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-xl p-3"
                >
                  <p className="text-red-400 text-sm text-center flex items-center justify-center gap-2">
                    ⚔️ {error} ⚔️
                  </p>
                </motion.div>
              )}
              
              <NeonButton type="submit" loading={loading}>
                <span className="flex items-center justify-center gap-2">
                  <LogIn size={18} />
                  ENTRER DANS L'ARÈNE
                </span>
              </NeonButton>
            </form>
            
            <div className="mt-6 pt-4 border-t border-cyan-500/20 text-center">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span>🏆 TEAM 4</span>
                <span>✦</span>
                <span>⚡ VANQUAIRE ⚡</span>
                <span>✦</span>
                <span>🌍 WORLD CHAMPIONS</span>
              </div>
              <p className="text-gray-600 text-xs mt-3 font-mono">
                demo: admin@vanquaire.com / 1234
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
      
      {/* Footer flottant */}
      <div className="relative z-10 pb-4 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-gray-600 text-xs font-mono"
        >
          ✦ 4 GUERRIERS · BACKEND + FRONTEND + 3D + UI/UX ✦
        </motion.p>
      </div>
    </div>
  );
};