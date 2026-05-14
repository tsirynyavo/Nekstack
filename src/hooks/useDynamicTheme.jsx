import { useEffect, useState } from 'react';

export const useDynamicTheme = () => {
  const [theme, setTheme] = useState('dark');
  const [intensity, setIntensity] = useState(0.9);

  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      const root = document.documentElement;
      
      // Thème selon l'heure
      if (hour >= 6 && hour < 12) {
        // Matin: cyan dominant
        setTheme('morning');
        setIntensity(0.7);
        root.style.setProperty('--theme-primary', '#00ffff');
        root.style.setProperty('--theme-secondary', '#0891b2');
      } else if (hour >= 12 && hour < 18) {
        // Après-midi: purple dominant
        setTheme('afternoon');
        setIntensity(0.8);
        root.style.setProperty('--theme-primary', '#a855f7');
        root.style.setProperty('--theme-secondary', '#7e22ce');
      } else if (hour >= 18 && hour < 22) {
        // Soir: magenta
        setTheme('evening');
        setIntensity(0.85);
        root.style.setProperty('--theme-primary', '#ec4899');
        root.style.setProperty('--theme-secondary', '#be185d');
      } else {
        // Nuit: dark intense
        setTheme('night');
        setIntensity(0.95);
        root.style.setProperty('--theme-primary', '#06b6d4');
        root.style.setProperty('--theme-secondary', '#3b82f6');
      }
      
      // Appliquer l'intensité
      root.style.setProperty('--bg-intensity', intensity.toString());
      root.style.setProperty('--glow-intensity', (intensity * 0.8).toString());
    };
    
    updateTheme();
    const interval = setInterval(updateTheme, 60000); // Vérifier chaque minute
    
    return () => clearInterval(interval);
  }, []);

  // Raccourci clavier pour forcer le thème (Ctrl+Shift+T)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        updateTheme();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return { theme, intensity };
};