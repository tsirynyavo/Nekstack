import { motion } from 'framer-motion';

export const NeonButton = ({ children, onClick, loading = false, variant = "primary" }) => {
  const variants = {
    primary: "from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-cyan-500/25",
    secondary: "from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 shadow-gray-500/25",
    danger: "from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-500/25",
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading}
      className={`relative w-full bg-gradient-to-r ${variants[variant]} text-white font-bold py-3 rounded-xl transition-all transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg overflow-hidden group`}
    >
      {/* Neon pulse animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Loading spinner */}
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          CHARGEMENT...
        </span>
      ) : children}
    </motion.button>
  );
};