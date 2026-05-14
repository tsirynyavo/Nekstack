import { Dashboard } from './pages/Dashboard';
import { useAuthStore } from './store';
import { useEffect } from 'react';

function App() {
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      // Connexion automatique immédiate
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

  return <Dashboard />;
}

export default App;