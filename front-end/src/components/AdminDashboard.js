import React from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaUserGraduate, FaClipboardList } from 'react-icons/fa';
import '../components/AdminDashboard.css'; // <-- importe ton CSS ici

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Bienvenue dans la gestion de notes et paiement Ecole Sevaina</h1>
      <div className="admin-menu">
        <Link to="/admin/paiement" className="admin-menu-item">
          <FaBed className="admin-icon" />
          <h2>Gérer les paiements</h2>
        </Link>

        <Link to="/admin/etudiants" className="admin-menu-item">
          <FaUserGraduate className="admin-icon" />
          <h2>Gérer les Étudiants</h2>
        </Link>

        <Link to="/admin/note" className="admin-menu-item">
          <FaClipboardList className="admin-icon" />
          <h2>Gérer les notes</h2>
        </Link>
      </div>
    </div>
  );
};
const links = [
    { to: '/admin/dashboard', label: 'Accueil' },
    { to: '/admin/paiement', label: 'Paiement écolage' },
    { to: '/admin/etudiants', label: 'Étudiants' },
    { to: '/admin/note', label: 'Notes' },
    { to: '/admin/rapport', label: 'Rapport' }, // <-- nouveau lien
    { to: '/admin/logout', label: 'Déconnexion' },
  ];

export default AdminDashboard;
