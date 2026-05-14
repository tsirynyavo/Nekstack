import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { UrbanFlux } from './feature/flows/UrbanFlux';
import { useAuthStore } from './store';
import { useEffect } from 'react';
import { UrbanTransit } from './feature/flows/UrbanTransit';
import { UrbanSafety } from './feature/flows/UrbanSafety';
function App() {
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      // Connexion automatique immédiate pour la démo
      login(
        { 
          id: 1, 
          email: 'admin@vanquaire.com', 
          name: 'Vanquaire Team' 
        },
        'demo-token-vanquaire'
      );
    }
  }, [isAuthenticated, login]);

  return (
    <BrowserRouter>
      <Routes>
        {/* La page d'accueil affiche le Dashboard */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Nouvelle route pour le Module C : Flux Urbains */}
        <Route path="/flux" element={<UrbanFlux />} />
        <Route path="/transit" element={<UrbanTransit />} />
        <Route path="/safety" element={<UrbanSafety />} />
        {/* Redirection automatique si la route n'existe pas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;