import { useEffect, useState } from 'react';
import { useAuthStore } from '../store';

export const DemoMode = () => {
  const { login, isAuthenticated } = useAuthStore();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const autoDemo = async () => {
      if (isAuthenticated) return;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        await fetch('/api/health', { signal: controller.signal });
        clearTimeout(timeoutId);
        console.log('✅ Backend détecté');
      } catch (error) {
        console.log('⚠️ Mode démo activé (backend indisponible)');
        setIsDemo(true);
        login(
          { 
            id: 1, 
            email: 'demo@vanquaire.com', 
            name: 'Demo Champion',
            role: 'demo'
          },
          'demo-token-vanquaire'
        );
      }
    };
    
    autoDemo();
  }, [isAuthenticated, login]);

  if (!isDemo) return null;
  
  return (
    <div className="fixed top-20 right-4 z-50 bg-yellow-500/20 backdrop-blur rounded-xl px-3 py-1 border border-yellow-500/50">
      <p className="text-yellow-400 text-xs flex items-center gap-1">
        <span>🎭</span> MODE DÉMO
      </p>
    </div>
  );
};