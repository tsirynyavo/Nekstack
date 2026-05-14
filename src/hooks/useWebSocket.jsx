import { useEffect, useState, useRef } from 'react';

export const useWebSocket = (url) => {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log('🔌 WebSocket connecté');
      setConnected(true);
      setReconnectAttempt(0);
    };
    
    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch (e) {
        console.error('Erreur parsing WebSocket:', e);
      }
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket déconnecté');
      setConnected(false);
      
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        setReconnectAttempt(prev => prev + 1);
        connect();
      }, Math.min(3000 * Math.pow(1.5, reconnectAttempt), 30000));
    };
    
    ws.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };
    
    wsRef.current = ws;
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const send = (message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [url]);

  return { data, connected, send, reconnectAttempt };
};

export const WebSocketStatus = ({ connected }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
      <span className="text-xs font-mono text-gray-400">
        {connected ? 'LIVE' : 'RECONNEXION...'}
      </span>
    </div>
  );
};