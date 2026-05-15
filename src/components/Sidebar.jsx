import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Zap, LayoutDashboard, Store, LogOut, ChevronDown, 
  Calendar, Map, Trophy, UserCheck, Menu, X, 
  AlertTriangle, Shield 
} from 'lucide-react';
import { useAuthStore } from '../store';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuthStore();
  const [marcheOpen, setMarcheOpen] = React.useState(false);
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-900 rounded-md border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30 lg:flex hidden"
      >
        {collapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-cyan-950/40 to-purple-950/40 backdrop-blur-md border-r border-cyan-500/20 z-40 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} overflow-y-auto`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center gap-2 p-4 border-b border-cyan-500/20 ${collapsed ? 'justify-center' : ''}`}>
            <Zap className="h-6 w-6 text-cyan-400 flex-shrink-0" />
            {!collapsed && <span className="text-white font-bold text-lg">Fianarantsoa Smart City</span>}
          </div>

          {/* Badge rôle */}
          {!collapsed && (
            <div className={`mx-4 mt-3 px-3 py-1.5 rounded-lg text-center text-xs font-mono ${isAdmin ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'}`}>
              {isAdmin ? '👑 MODE ADMINISTRATEUR' : '👤 MODE CITOYEN'}
            </div>
          )}

          <nav className="flex-1 p-4 space-y-2">
            {/* Dashboard */}
            <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${isActive ? 'bg-cyan-600/30 text-cyan-300 border-l-2 border-cyan-400' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'} ${collapsed ? 'justify-center' : ''}`} title={collapsed ? "Dashboard" : ""}>
              <LayoutDashboard size={18} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>

            {/* Électricité */}
            <NavLink to="/electricite" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${isActive ? 'bg-cyan-600/30 text-cyan-300 border-l-2 border-cyan-400' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'} ${collapsed ? 'justify-center' : ''}`} title={collapsed ? "Électricité" : ""}>
              <Zap size={18} />
              {!collapsed && <span>Électricité</span>}
            </NavLink>

            {/* Menu Marchés */}
            <div>
              <button onClick={() => !collapsed && setMarcheOpen(!marcheOpen)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition text-gray-300 hover:bg-gray-700/50 hover:text-white ${collapsed ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center gap-3">
                  <Store size={18} />
                  {!collapsed && <span>Marchés</span>}
                </div>
                {!collapsed && <ChevronDown size={14} className={`transition-transform ${marcheOpen ? 'rotate-180' : ''}`} />}
              </button>

              {marcheOpen && !collapsed && (
                <div className="ml-6 mt-1 space-y-1">
                  <NavLink to="/marches/reserver" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-600/30 rounded-md transition">
                    <Calendar size={14} /> Réserver un stand
                  </NavLink>
                  <NavLink to="/marches/mes-reservations" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-600/30 rounded-md transition">
                    <UserCheck size={14} /> Mes réservations
                  </NavLink>
                  <NavLink to="/marches/carte" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-600/30 rounded-md transition">
                    <Map size={14} /> Carte interactive
                  </NavLink>
                  <NavLink to="/marches/classement" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-600/30 rounded-md transition">
                    <Trophy size={14} /> Classement
                  </NavLink>
                </div>
              )}
            </div>

            {/* Admin uniquement */}
            {isAdmin && !collapsed && (
              <NavLink to="/marches/admin" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition text-purple-300 hover:bg-purple-600/30 border-l-2 border-purple-500">
                <Shield size={18} />
                <span>Administration</span>
              </NavLink>
            )}

            {/* Icônes rapides quand réduit */}
            {collapsed && (
              <div className="space-y-1 mt-2">
                <NavLink to="/marches/reserver" className="flex justify-center px-3 py-2 text-gray-300 hover:bg-cyan-600/30 rounded-md transition" title="Réserver">
                  <Calendar size={18} />
                </NavLink>
                <NavLink to="/marches/mes-reservations" className="flex justify-center px-3 py-2 text-gray-300 hover:bg-cyan-600/30 rounded-md transition" title="Mes réservations">
                  <UserCheck size={18} />
                </NavLink>
                <NavLink to="/marches/carte" className="flex justify-center px-3 py-2 text-gray-300 hover:bg-cyan-600/30 rounded-md transition" title="Carte">
                  <Map size={18} />
                </NavLink>
                <NavLink to="/marches/classement" className="flex justify-center px-3 py-2 text-gray-300 hover:bg-cyan-600/30 rounded-md transition" title="Classement">
                  <Trophy size={18} />
                </NavLink>
                {isAdmin && (
                  <NavLink to="/marches/admin" className="flex justify-center px-3 py-2 text-purple-300 hover:bg-purple-600/30 rounded-md transition" title="Admin">
                    <Shield size={18} />
                  </NavLink>
                )}
              </div>
            )}
          </nav>

          {/* Déconnexion */}
          <div className="p-4 border-t border-cyan-500/20">
            <button onClick={logout} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/20 transition w-full ${collapsed ? 'justify-center' : ''}`} title={collapsed ? "Quitter" : ""}>
              <LogOut size={18} />
              {!collapsed && <span>Quitter</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;