import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import ElectriciteCitoyen from './pages/ElectriciteCitoyen';
import Sidebar from './components/Sidebar';
import { useAuthStore } from './store';
import { useEffect, useState } from 'react';
import { Login } from './pages/Login';

// Option B
import FormulaireReservation from './components/FormulaireReservation';
import MesReservations from './components/MesReservations';
import CarteStands from './components/CarteStands';
import Classement from './components/Classement';
import AdminStandPanel from './components/AdminStandPanel';

function App() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Si pas authentifié, on affiche Login (toujours à l'intérieur du Router)
  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <main className="flex-1 transition-all duration-300 min-h-screen" style={{ marginLeft: sidebarCollapsed ? '5rem' : '16rem' }}>
          <div className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/electricite" element={<ElectriciteCitoyen />} />
              <Route path="/marches/reserver" element={<FormulaireReservation />} />
              <Route path="/marches/mes-reservations" element={<MesReservations />} />
              <Route path="/marches/carte" element={<CarteStands />} />
              <Route path="/marches/classement" element={<Classement />} />
              {isAdmin && <Route path="/marches/admin" element={<AdminStandPanel />} />}
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;