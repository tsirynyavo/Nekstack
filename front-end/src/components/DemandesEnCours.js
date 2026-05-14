import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../components/FormConge.css";

const DemandesEnCours = (props) => {
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Récupérer employeId depuis props ou location
  const employeId = props.employeId || location.state?.employeId;

  useEffect(() => {
    if (!employeId) return;

    const fetchCongesEnAttente = async () => {
      setLoading(true);
      try {
        // Utiliser le même endpoint que CongesEmploye pour avoir tous les congés
        const res = await axios.get(`http://localhost:5050/conges/all-by-employee/${employeId}`);
        
        // Filtrer uniquement les congés "en_attente"
        const enCours = res.data
          .filter(c => c.statut === "en_attente")
          .sort((a, b) => new Date(b.createdAt || b.dateDebut) - new Date(a.createdAt || a.dateDebut));
        
        setConges(enCours);
      } catch (err) {
        console.error("Erreur:", err);
        // Fallback: essayer l'endpoint normal
        try {
          const resFallback = await axios.get(`http://localhost:5050/conges`, {
            params: { 
              employeId: employeId,
              startDate: new Date(2024, 0, 1).toISOString(),
              endDate: new Date(2025, 11, 31).toISOString()
            }
          });
          
          const enCours = resFallback.data.conges
            ?.filter(c => c.statut === "en_attente")
            .sort((a, b) => new Date(b.createdAt || b.dateDebut) - new Date(a.createdAt || a.dateDebut)) || [];
          
          setConges(enCours);
        } catch (fallbackErr) {
          console.error("Erreur fallback:", fallbackErr);
          setConges([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCongesEnAttente();
  }, [employeId]);

  if (loading) {
    return (
      <div className="form-container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (!employeId) {
    return (
      <div className="form-container">
        <p>Employé non trouvé.</p>
        <button type="button" onClick={() => navigate(-1)}>Retour</button>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>📋 Mes demandes en cours</h2>
      
      {conges.length === 0 ? (
        <div className="no-requests">
          <p>Aucune demande en attente de validation.</p>
          <button 
            type="button" 
            onClick={() => navigate("/employee/conges/add", { state: { employeId } })}
            className="primary-btn"
          >
            ➕ Faire une nouvelle demande
          </button>
        </div>
      ) : (
        <>
          <div className="requests-list">
            {conges.map(c => (
              <div key={c._id} className="request-item">
                <div className="request-header">
                  <span className={`status-badge ${c.statut}`}>
                    {c.statut === "en_attente" ? "⏳ En attente" : c.statut}
                  </span>
                  <span className="request-type">{c.type}</span>
                </div>
                
                <div className="request-dates">
                  📅 {new Date(c.dateDebut).toLocaleDateString()} - {new Date(c.dateFin).toLocaleDateString()}
                </div>
                
                {c.description && (
                  <div className="request-description">
                    📝 {c.description}
                  </div>
                )}
                
                <div className="request-footer">
                  <small>
                    Demandé le {new Date(c.createdAt || c.dateDebut).toLocaleDateString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
          
          <p className="requests-count">
            {conges.length} demande(s) en attente de validation
          </p>
        </>
      )}
      
      <div className="form-buttons">
        <button type="button" onClick={() => navigate(-1)}>← Retour</button>
      </div>
    </div>
  );
};

export default DemandesEnCours;