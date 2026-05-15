import React, { useState, useEffect } from "react";
import axios from "axios";
import "../components/PaiementEmploye.css";

const PaiementEmploye = ({ employeId }) => {
  const [paiements, setPaiements] = useState([]);
  const [employe, setEmploye] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!employeId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchEmploye(),
          fetchPaiementsEtStats()
        ]);
      } catch (err) {
        console.error("Erreur chargement données:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeId]);

  const fetchEmploye = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/employees/${employeId}`);
      setEmploye(res.data);
    } catch (err) {
      console.error("Erreur employé:", err);
    }
  };

  const fetchPaiementsEtStats = async () => {
    try {
      // Récupérer les statistiques (qui contiennent le dernier paiement)
      const statsRes = await axios.get(`http://localhost:5050/paiements/statistiques/${employeId}`);
      setStats(statsRes.data);
      
      // Pour l'historique complet, utiliser l'endpoint normal des paiements
      const paiementsRes = await axios.get("http://localhost:5050/paiements");
      const data = paiementsRes.data || {};
      const paiementsData = data.paiements || [];
      
      // Filtrer les paiements de cet employé
      const paiementsEmploye = paiementsData.filter(p => 
        p.employe && p.employe._id === employeId
      );
      
      // Trier par date (du plus récent au plus ancien)
      paiementsEmploye.sort((a, b) => new Date(b.datePaiement || b.createdAt) - new Date(a.datePaiement || a.createdAt));
      
      setPaiements(paiementsEmploye);
    } catch (err) {
      console.error("Erreur chargement données paiements:", err);
      setPaiements([]);
      setStats(null);
    }
  };

  // Fonction pour formater le salaire
  const formatSalaire = (salaire) => {
    if (!salaire && salaire !== 0) return '0';
    
    let montant = salaire;
    if (typeof salaire === 'object' && salaire !== null) {
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

  // Fonction pour formater la date
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour formater le mois
  const formatMois = (mois) => {
    if (!mois) return "—";
    const date = new Date(mois + "-01");
    return date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Obtenir le dernier paiement depuis les stats
  const dernierPaiement = stats?.dernierPaiement ? {
    ...stats.dernierPaiement,
    // Ajouter les champs manquants depuis le premier paiement de la liste
    mois: paiements[0]?.mois,
    salaireBase: paiements[0]?.salaireBase,
    salaireNet: paiements[0]?.salaireNet,
    irsa: paiements[0]?.irsa,
    statut: 'payé' // Les stats ne contiennent que les paiements payés
  } : null;

  if (loading) {
    return (
      <div className="xxpaiement-employe-container">
        <div className="loading">Chargement des informations de paie...</div>
      </div>
    );
  }

  if (!employe) {
    return (
      <div className="xxpaiement-employe-container">
        <div className="error">Employé non trouvé</div>
      </div>
    );
  }

  return (
    <div className="xxpaiement-employe-container">
      <div className="xxpaiement-header">
        <h2>💰 Mes Informations de Paie</h2>
        <p className="xxpaiement-subtitle">
          Consultez vos informations salariales et historique des paiements
        </p>
      </div>

      {error && (
        <div className="xxerror-message">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}


      {/* Dernier paiement détaillé */}
      {paiements.length > 0 && (
        <div className="xxdernier-paiement-details">
          <h3>📋 Détails du Dernier Paiement</h3>
          <div className="xxdetails-grid">
            <div className="xxdetail-item">
              <strong>Mois concerné :</strong>
              <span>{formatMois(paiements[0].mois)}</span>
            </div>
            <div className="xxdetail-item">
              <strong>Date de paiement :</strong>
              <span>{formatDate(paiements[0].datePaiement)}</span>
            </div>
            <div className="xxdetail-item">
              <strong>Salaire de base :</strong>
              <span>{formatSalaire(paiements[0].salaireBase)} MGA</span>
            </div>
            <div className="xxdetail-item">
              <strong>Salaire net perçu :</strong>
              <span className="salaire-net">{formatSalaire(paiements[0].salaireNet)} MGA</span>
            </div>
            <div className="xxdetail-item">
              <strong>Impôt (IRSA) :</strong>
              <span>{formatSalaire(paiements[0].irsa)} MGA</span>
            </div>
            <div className="xxdetail-item">
              <strong>Statut :</strong>
              <span className={`statut-badge statut-${paiements[0].statut}`}>
                {paiements[0].statut === 'validé' ? '✅ Validé' : '💰 Payé'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Historique des paiements */}
      <div className="xxhistorique-paiements">
        <h3>📊 Historique des Paiements ({paiements.length})</h3>
        
        {paiements.length === 0 ? (
          <div className="xxno-paiements">
            <p>Aucun paiement enregistré pour le moment</p>
          </div>
        ) : (
          <div className="xxpaiements-list">
            {paiements.map((paiement, index) => (
              <div key={paiement._id} className={`xxpaiement-item ${index === 0 ? 'dernier-paiement' : ''}`}>
                <div className="xxpaiement-header-item">
                  <span className="xxpaiement-mois">{formatMois(paiement.mois)}</span>
                  <span className={`xxpaiement-statut statut-${paiement.statut}`}>
                    {paiement.statut === 'validé' ? '✅ Validé' : '💰 Payé'}
                  </span>
                </div>
                <div className="xxpaiement-details">
                  <div className="xxpaiement-info">
                    <span className="xxlabel">Date paiement :</span>
                    <span className="value">{formatDate(paiement.datePaiement)}</span>
                  </div>
                  <div className="xxpaiement-info">
                    <span className="xxlabel">Salaire net :</span>
                    <span className="value salaire-net">{formatSalaire(paiement.salaireNet)} MGA</span>
                  </div>
                  <div className="xxpaiement-info">
                    <span className="xxlabel">IRSA :</span>
                    <span className="value">{formatSalaire(paiement.irsa)} MGA</span>
                  </div>
                </div>
                {index === 0 && <div className="xxbadge-dernier">DERNIER</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      </div>
   
  );
};

export default PaiementEmploye;