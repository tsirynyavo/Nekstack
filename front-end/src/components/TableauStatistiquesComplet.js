import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import "../components/TableauStatistiques.css"; // Changement du nom CSS

const TableauStatistiquesComplet = () => {
  const { employeId } = useParams();
  const navigate = useNavigate();
  const [statistiquesPresence, setStatistiquesPresence] = useState(null);
  const [statistiquesConges, setStatistiquesConges] = useState(null);
  const [paiementsData, setPaiementsData] = useState([]);
  const [employe, setEmploye] = useState(null);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  const fetchData = async () => {
    if (!employeId) {
      navigate("/admin/presence");
      return;
    }

    try {
      setLoading(true);

      // ✅ Solution : Gérer chaque API séparément
      const fetchEmploye = async () => {
        try {
          const response = await axios.get(`http://localhost:5050/employees/${employeId}`);
          setEmploye(response.data);
        } catch (error) {
          console.error("Erreur employé:", error);
          if (error.response?.status === 404) {
            alert("Employé non trouvé");
            navigate("/admin/presence");
            throw error; // Arrêter l'exécution
          }
        }
      };

      const fetchPresences = async () => {
        try {
          const response = await axios.get(`http://localhost:5050/presences/statistiques/${employeId}`);
          setStatistiquesPresence(response.data);
        } catch (error) {
          console.error("Erreur présences:", error);
          setStatistiquesPresence(null); // Mettre à null au lieu de bloquer
        }
      };

      const fetchConges = async () => {
        try {
          const response = await axios.get(`http://localhost:5050/conges/statistiques/${employeId}`);
          setStatistiquesConges(response.data);
        } catch (error) {
          console.error("Erreur congés:", error);
          setStatistiquesConges(null); // Mettre à null au lieu de bloquer
        }
      };

      const fetchPaiements = async () => {
        try {
          const response = await axios.get(`http://localhost:5050/paiements`);
          const paiementsEmploye = response.data.paiements ? 
            response.data.paiements.filter(p => p.employe && p.employe._id === employeId) :
            [];
          setPaiementsData(paiementsEmploye);
        } catch (error) {
          console.error("Erreur paiements:", error);
          setPaiementsData([]);
        }
      };

      // Exécuter en parallèle mais gérer les erreurs individuellement
      await fetchEmploye(); // Si celui-ci échoue, on arrête
      await Promise.allSettled([
        fetchPresences(),
        fetchConges(),
        fetchPaiements()
      ]);

    } catch (error) {
      console.error("Erreur critique:", error);
      // Ne plus afficher d'alerte générique ici
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [employeId, navigate]);
  // Fonction pour calculer les indicateurs de présence
  const calculerIndicateurs = () => {
    if (!statistiquesPresence) return {};
    
    const totalPresencesReelles = statistiquesPresence.presentsJournee + 
                                 statistiquesPresence.presentsMatin + 
                                 statistiquesPresence.presentsSoir;
    
    const totalJoursAnalyse = statistiquesPresence.totalJours || 1;
    const tauxPresence = (totalPresencesReelles / totalJoursAnalyse) * 100;
    
    return {
      tauxPresence: tauxPresence.toFixed(1),
      totalPresences: totalPresencesReelles,
      joursAvecRetard: statistiquesPresence.joursAvecRetard || 0,
      pourcentageJoursRetard: statistiquesPresence.pourcentageJoursRetard ? 
                             statistiquesPresence.pourcentageJoursRetard.toFixed(1) : '0.0',
      heuresRetardTotal: (statistiquesPresence.totalRetardMinutes / 60).toFixed(1)
    };
  };

  // Fonction pour formater le salaire (identique à ListePaiements)
  const formatSalaire = (salaire) => {
    if (!salaire && salaire !== 0) return '0';
    
    let montant = salaire;
    if (typeof salaire === 'object' && salaire !== null) {
      // Cas Decimal128 de MongoDB
      if (salaire.$numberDecimal) {
        montant = parseFloat(salaire.$numberDecimal);
      } else {
        montant = parseFloat(salaire.toString());
      }
    } else if (typeof salaire === 'string') {
      montant = parseFloat(salaire);
    }
    
    return isNaN(montant) ? '0' : montant.toLocaleString('fr-FR');
  };

  // Fonction pour formater les mois (identique à ListePaiements)
  const formatMois = (mois) => {
    if (!mois) return "—";
    const date = new Date(mois + "-01");
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };
// Fonction pour calculer les informations de paiement - CORRECTION
const calculerInfosPaiement = () => {
  if (paiementsData.length === 0) {
    return {
      totalPaiements: 0,
      dernierPaiement: null,
      dernierMois: null,
      salaireBase: employe?.salaire ? formatSalaire(employe.salaire) : '0'
    };
  }

  // ⭐⭐ CORRECTION : Filtrer uniquement les paiements "payé"
  const paiementsPayes = paiementsData.filter(p => p.statut === 'payé');
  
  if (paiementsPayes.length === 0) {
    return {
      totalPaiements: 0,
      dernierPaiement: null,
      dernierMois: null,
      salaireBase: employe?.salaire ? formatSalaire(employe.salaire) : '0'
    };
  }

  // Trier par date pour trouver le dernier paiement PAYÉ
  const paiementsTries = [...paiementsPayes].sort((a, b) => 
    new Date(b.mois) - new Date(a.mois)
  );

  const dernierPaiement = paiementsTries[0];

  return {
    totalPaiements: paiementsPayes.length, // ⭐⭐ Compter seulement les payés
    dernierPaiement: {
      montant: dernierPaiement.salaireNet || 0,
      date: dernierPaiement.datePaiement || dernierPaiement.createdAt
    },
    dernierMois: dernierPaiement.mois,
    salaireBase: employe?.salaire ? formatSalaire(employe.salaire) : '0'
  };
};

  const indicateurs = calculerIndicateurs();
  const infosPaiement = calculerInfosPaiement();

  // Données pour les graphiques
  const repartitionPresenceData = statistiquesPresence ? [
    { name: 'Complets', value: statistiquesPresence.presentsJournee },
    { name: 'Matin seul', value: statistiquesPresence.presentsMatin },
    { name: 'Soir seul', value: statistiquesPresence.presentsSoir },
    { name: 'Absents', value: statistiquesPresence.absents }
  ] : [];

  const congesParTypeData = statistiquesConges ? [
    { name: 'Annuel', value: statistiquesConges.congesAnnuel },
    { name: 'Maladie', value: statistiquesConges.congesMaladie },
    { name: 'Exceptionnel', value: statistiquesConges.congesExceptionnel },
    { name: 'Maternité', value: statistiquesConges.congesMaternite }
  ] : [];

  // Couleurs sobres
  const couleurs = ['#666666', '#888888', '#AAAAAA', '#CCCCCC'];

  if (loading) {
    return (
      <div className="stats-dashboard-loading">
        <div className="stats-loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="stats-dashboard-container">
      {/* Header */}
      <div className="stats-dashboard-header">
        <div className="stats-header-left">
          <button onClick={() => navigate(-1)} className="stats-back-btn">← Retour</button>
          <div className="stats-employee-title">
            <h1>{employe?.prenom} {employe?.nom}</h1>
            <div className="stats-employee-details">
              <span className="stats-badge">Matricule: {employe?.matricule}</span>
              <span className="stats-badge">Poste: {employe?.poste}</span>
              <span className="stats-badge">{statistiquesPresence?.totalJours || 0} jours analysés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes principales - Ligne 1 */}
      <div className="stats-grid-main">
        {/* Carte Taux de Présence */}
        <div className="stats-card-main">
          <div className="stats-card-icon">📅</div>
          <div className="stats-card-content">
            <h3>Taux de Présence</h3>
            <div className="stats-main-value">{indicateurs.tauxPresence}%</div>
            <div className="stats-card-details">
              <span>{indicateurs.totalPresences}/{statistiquesPresence?.totalJours} jours</span>
            </div>
          </div>
        </div>

        {/* Carte Salaire de Base */}
        <div className="stats-card-main">
          <div className="stats-card-icon">💰</div>
          <div className="stats-card-content">
            <h3>Salaire de Base</h3>
            <div className="stats-main-value">
              {infosPaiement.salaireBase} MGA
            </div>
            <div className="stats-card-details">
              <span>Salaire mensuel brut</span>
            </div>
          </div>
        </div>

        {/* Carte Dernier Paiement */}
        <div className="stats-card-main">
          <div className="stats-card-icon">🕓</div>
          <div className="stats-card-content">
            <h3>Dernier Paiement</h3>
            <div className="stats-main-value">
              {infosPaiement.dernierPaiement ? 
                `${formatSalaire(infosPaiement.dernierPaiement.montant)} MGA` : '0 MGA'
              }
            </div>
            <div className="stats-card-details">
              <span>
                {infosPaiement.dernierPaiement ? 
                  new Date(infosPaiement.dernierPaiement.date).toLocaleDateString('fr-FR') : 
                  'Aucun paiement'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Carte Dernier Mois Payé */}
        <div className="stats-card-main">
          <div className="stats-card-icon">📆</div>
          <div className="stats-card-content">
            <h3>Dernier Mois Payé</h3>
            <div className="stats-main-value">
              {infosPaiement.dernierMois ? 
                formatMois(infosPaiement.dernierMois) : 'Aucun'
              }
            </div>
            <div className="stats-card-details">
              <span>Dernière période payée</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes détaillées - Ligne 2 */}
      <div className="stats-grid-secondary">
        {/* Carte Présence Complète */}
        <div className="stats-card-secondary">
          <div className="stats-card-icon">✅</div>
          <div className="stats-card-content">
            <h3>Présent Journée</h3>
            <div className="stats-main-value">{statistiquesPresence?.presentsJournee || 0}</div>
            <div className="stats-card-details">
              <span>jours complets</span>
            </div>
          </div>
        </div>

        {/* Carte Absences */}
        <div className="stats-card-secondary">
          <div className="stats-card-icon">❌</div>
          <div className="stats-card-content">
            <h3>Absences</h3>
            <div className="stats-main-value">{statistiquesPresence?.absents || 0}</div>
            <div className="stats-card-details">
              <span>jours</span>
            </div>
          </div>
        </div>

        {/* Carte Solde Congés */}
        <div className="stats-card-secondary">
          <div className="stats-card-icon">🏖️</div>
          <div className="stats-card-content">
            <h3>Solde Congés</h3>
            <div className="stats-main-value">{statistiquesConges?.employe.congerestant || 0}j</div>
            <div className="stats-card-details">
              <span>reste sur {statistiquesConges?.employe.congetotal || 0}j</span>
            </div>
          </div>
        </div>

        {/* Carte Retard Moyen */}
        <div className="stats-card-secondary">
          <div className="stats-card-icon">⏰</div>
          <div className="stats-card-content">
            <h3>Retard Moyen</h3>
            <div className="stats-main-value">{statistiquesPresence?.moyenneRetardParJour?.toFixed(1) || 0}m</div>
            <div className="stats-card-details">
              <span>par jour</span>
            </div>
          </div>
        </div>

        {/* Carte Jours avec Retard */}
        <div className="stats-card-secondary">
          <div className="stats-card-icon">📉</div>
          <div className="stats-card-content">
            <h3>Jours avec Retard</h3>
            <div className="stats-main-value">{indicateurs.joursAvecRetard}</div>
            <div className="stats-card-details">
              <span>{indicateurs.pourcentageJoursRetard}% des jours</span>
            </div>
          </div>
        </div>

        {/* Carte Total Paiements */}
        <div className="stats-card-secondary">
          <div className="stats-card-icon">📊</div>
          <div className="stats-card-content">
            <h3>Total Paiements</h3>
            <div className="stats-main-value">{infosPaiement.totalPaiements}</div>
            <div className="stats-card-details">
              <span>paiements enregistrés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Graphiques */}
      <div className="stats-charts-section">
        <h2>Analytics Détaillés</h2>
        
        <div className="stats-charts-grid">
          {/* Graphique Répartition Présences */}
          <div className="stats-chart-card">
            <h4>Répartition des Présences</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={repartitionPresenceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {repartitionPresenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={couleurs[index % couleurs.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique Types de Congés */}
          <div className="stats-chart-card">
            <h4>Types de Congés Demandés</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={congesParTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#888888" name="Nombre de demandes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tableau de bord détaillé */}
      <div className="stats-detailed-section">
        <div className="stats-detailed-column">
          <h3>📈 Statistiques de Présence Détaillées</h3>
          <div className="stats-detailed-list">
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Total jours analysés:</span>
              <span className="stats-detailed-value">{statistiquesPresence?.totalJours || 0}</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Présences matin uniquement:</span>
              <span className="stats-detailed-value">{statistiquesPresence?.presentsMatin || 0} jours</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Présences soir uniquement:</span>
              <span className="stats-detailed-value">{statistiquesPresence?.presentsSoir || 0} jours</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Présences complètes (matin+soir):</span>
              <span className="stats-detailed-value">{statistiquesPresence?.presentsJournee || 0} jours</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Absences complètes:</span>
              <span className="stats-detailed-value">{statistiquesPresence?.absents || 0} jours</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Retard total accumulé:</span>
              <span className="stats-detailed-value">{statistiquesPresence ? Math.round(statistiquesPresence.totalRetardMinutes / 60) : 0} heures</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Retard moyen par jour:</span>
              <span className="stats-detailed-value">{statistiquesPresence?.moyenneRetardParJour?.toFixed(1) || 0} minutes</span>
            </div>
          </div>
        </div>

        <div className="stats-detailed-column">
          <h3>💰 Informations de Paiement</h3>
          <div className="stats-detailed-list">
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Salaire de base:</span>
              <span className="stats-detailed-value">{infosPaiement.salaireBase} MGA</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Dernier paiement:</span>
              <span className="stats-detailed-value">
                {infosPaiement.dernierPaiement ? 
                  `${formatSalaire(infosPaiement.dernierPaiement.montant)} MGA` : 
                  'Aucun paiement'
                }
              </span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Dernier mois payé:</span>
              <span className="stats-detailed-value">
                {infosPaiement.dernierMois ? 
                  formatMois(infosPaiement.dernierMois) : 
                  '—'
                }
              </span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Date dernier paiement:</span>
              <span className="stats-detailed-value">
                {infosPaiement.dernierPaiement ? 
                  new Date(infosPaiement.dernierPaiement.date).toLocaleDateString('fr-FR') : 
                  '—'
                }
              </span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Total paiements enregistrés:</span>
              <span className="stats-detailed-value">{infosPaiement.totalPaiements}</span>
            </div>
          </div>
        </div>

        <div className="stats-detailed-column">
          <h3>🏖️ Statistiques de Congés Détaillées</h3>
          <div className="stats-detailed-list">
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Total demandes de congés:</span>
              <span className="stats-detailed-value">{statistiquesConges?.totalConges || 0}</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Congés approuvés:</span>
              <span className="stats-detailed-value">{statistiquesConges?.congesApprouves || 0} ({statistiquesConges?.pourcentageApprouves || 0}%)</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Congés en attente:</span>
              <span className="stats-detailed-value">{statistiquesConges?.congesEnAttente || 0} ({statistiquesConges?.pourcentageEnAttente || 0}%)</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Congés refusés:</span>
              <span className="stats-detailed-value">{statistiquesConges?.congesRefuses || 0} ({statistiquesConges?.pourcentageRefuses || 0}%)</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Jours de congés pris:</span>
              <span className="stats-detailed-value">{statistiquesConges?.totalJoursPris || 0}</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Solde congés restant:</span>
              <span className="stats-detailed-value">{statistiquesConges?.employe.congerestant || 0} / {statistiquesConges?.employe.congetotal || 0} jours</span>
            </div>
            <div className="stats-detailed-item">
              <span className="stats-detailed-label">Congé le plus long:</span>
              <span className="stats-detailed-value">{statistiquesConges?.congeLePlusLong || 0} jours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableauStatistiquesComplet;