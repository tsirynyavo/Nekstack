import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = "", glow = false, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative group ${className}`}
      onClick={onClick}
    >
      {/* Glow effect */}
      {glow && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition duration-500" />
      )}
      
      {/* Glass content */}
      <div className="relative glass rounded-2xl border border-cyan-500/20 p-6 backdrop-blur-xl overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl border border-cyan-500/0 group-hover:border-cyan-500/30 transition-all duration-500" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  );
};