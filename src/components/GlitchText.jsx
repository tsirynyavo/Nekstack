import { motion } from 'framer-motion';

export const GlitchText = ({ text, className = "" }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <motion.span
        animate={{ x: [-2, 2, -1, 1, 0] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
        className="relative z-10"
      >
        {text}
      </motion.span>
      <span 
        className="absolute top-0 left-0 text-cyan-400 opacity-70 blur-[1px]"
        style={{ clipPath: 'inset(20% 0 30% 0)' }}
      >
        {text}
      </span>
      <span 
        className="absolute top-0 left-0 text-purple-400 opacity-70 blur-[1px]"
        style={{ clipPath: 'inset(60% 0 10% 0)' }}
      >
        {text}
      </span>
    </div>
  );
};