import { useState, useEffect } from 'react';

export const useWebSocket = (url) => {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // WebSocket désactivé pour la démo
    setConnected(false);
    return () => {};
  }, [url]);

  return { data, connected };
};

export const WebSocketStatus = ({ connected }) => {
  return (
    <span className="text-xs text-gray-500">
      {connected ? '🟢 Live' : '⚫ Hors ligne'}
    </span>
  );
};