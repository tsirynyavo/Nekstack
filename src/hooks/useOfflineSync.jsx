import { useState, useEffect } from 'react';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      syncPendingRequests();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      setTimeout(() => setShowOfflineBanner(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const saved = localStorage.getItem('pendingRequests');
    if (saved) setPendingRequests(JSON.parse(saved));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingRequests = async () => {
    const saved = localStorage.getItem('pendingRequests');
    if (!saved) return;
    
    const requests = JSON.parse(saved);
    for (const req of requests) {
      try {
        await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body
        });
      } catch (e) {
        console.error('Sync failed for:', req.url, e);
      }
    }
    localStorage.removeItem('pendingRequests');
    setPendingRequests([]);
  };

  const queueRequest = (request) => {
    const newQueue = [...pendingRequests, request];
    setPendingRequests(newQueue);
    localStorage.setItem('pendingRequests', JSON.stringify(newQueue));
  };

  return { 
    isOnline, 
    queueRequest, 
    showOfflineBanner,
    pendingCount: pendingRequests.length 
  };
};

export const OfflineBanner = ({ show, count }) => {
  if (!show) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-yellow-500/90 backdrop-blur rounded-xl px-4 py-2 shadow-lg border border-yellow-500 animate-pulse">
      <p className="text-black text-sm font-bold flex items-center gap-2">
        <span>⚠️</span>
        Mode hors-ligne - {count} requête(s) en attente
      </p>
    </div>
  );
};