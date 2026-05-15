import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Shield, Zap } from 'lucide-react';
import { Particles3D } from '../components/Particles3D';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { useAuthStore } from '../store';
import api from '../api';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Particles3D />
      <div className="fixed inset-0 bg-cyber-grid bg-grid pointer-events-none" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md"
        >
          <GlassCard glow>
            <div className="text-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center"
              >
                <span className="text-3xl font-black">V</span>
              </motion.div>
              
              <h1 className="text-3xl font-bold text-white mb-2">Fianarantsoa Smart City</h1>
              <p className="text-gray-400 text-sm">Plateforme de gestion intelligente</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-cyan-400 text-sm mb-2 font-mono">EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-xl px-5 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="exemple@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-cyan-400 text-sm mb-2 font-mono">MOT DE PASSE</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-xl px-5 py-3 text-white pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {error && (
                <motion.div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </motion.div>
              )}
              
              <NeonButton type="submit" loading={loading}>
                <span className="flex items-center justify-center gap-2">
                  <LogIn size={18} />
                  SE CONNECTER
                </span>
              </NeonButton>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};