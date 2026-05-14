import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTasks, FaCalendar, FaExclamationTriangle, FaCheck, FaUser, FaBuilding, FaTimes, FaFlagCheckered } from "react-icons/fa";
import "../components/TachesEmploye.css";

const TachesEmploye = ({ employeId }) => {
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  
  // États pour le modal
  const [showModal, setShowModal] = useState(false);
  const [tacheToComplete, setTacheToComplete] = useState(null);
  
  // État pour les descriptions étendues
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  useEffect(() => {
    fetchTaches();
  }, [employeId, statutFilter]);

  const fetchTaches = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5050/taches/employe/${employeId}`, {
        params: { statut: statutFilter }
      });
      setTaches(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur chargement tâches:", err);
      setError("Erreur lors du chargement des tâches");
      setLoading(false);
    }
  };

  const updateStatutTache = async (tacheId, nouveauStatut) => {
    try {
      await axios.put(`http://localhost:5050/taches/${tacheId}/statut`, {
        statut: nouveauStatut
      });
      fetchTaches(); // Recharger la liste
    } catch (err) {
      console.error("Erreur mise à jour statut:", err);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  // Ouvrir le modal de confirmation
  const openConfirmationModal = (tache) => {
    setTacheToComplete(tache);
    setShowModal(true);
  };

  // Fermer le modal
  const closeConfirmationModal = () => {
    setShowModal(false);
    setTacheToComplete(null);
  };

  // Confirmer la fin de tâche
  const confirmCompletion = () => {
    if (tacheToComplete) {
      updateStatutTache(tacheToComplete._id, 'terminé');
      closeConfirmationModal();
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      'en_cours': { class: 'xstatut-en_cours', text: 'En Cours', icon: FaExclamationTriangle },
      'terminé': { class: 'xstatut-terminé', text: 'Terminé', icon: FaCheck },
      'annulé': { class: 'xstatut-annulé', text: 'Annulé', icon: FaExclamationTriangle }
    };
    
    const badge = badges[statut] || { class: 'xstatut-default', text: statut, icon: FaExclamationTriangle };
    const IconComponent = badge.icon;
    
    return (
      <span className={`xstatut-badge ${badge.class}`}>
        <IconComponent style={{ marginRight: "5px" }} />
        {badge.text}
      </span>
    );
  };

  const getPrioriteBadge = (priorite) => {
    const badges = {
      'urgente': { class: 'xpriorite-urgente', text: 'Urgente' },
      'haute': { class: 'xpriorite-haute', text: 'Haute' },
      'normale': { class: 'xpriorite-normale', text: 'Normale' },
      'basse': { class: 'xpriorite-basse', text: 'Basse' }
    };
    
    const badge = badges[priorite] || { class: 'xpriorite-default', text: priorite };
    return <span className={`xpriorite-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getAssignationIcon = (tache) => {
    if (tache.assignationType === 'personne') return FaUser;
    if (tache.assignationType === 'departement') return FaBuilding;
    return FaTasks;
  };

  const getAssignationText = (tache) => {
    if (tache.assignationType === 'personne' && tache.employe_id) {
      return `Assignée personnellement`;
    }
    if (tache.assignationType === 'departement' && tache.departement_id) {
      return `Assignée au département ${tache.departement_id.nom}`;
    }
    return "Assignation";
  };

  const getDaysRemaining = (dateLimite) => {
    const today = new Date();
    const limitDate = new Date(dateLimite);
    const diffTime = limitDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `En retard de ${Math.abs(diffDays)} jour(s)`, class: 'danger' };
    if (diffDays === 0) return { text: "Aujourd'hui", class: 'warning' };
    if (diffDays === 1) return { text: "Demain", class: 'warning' };
    return { text: `Dans ${diffDays} jour(s)`, class: 'normal' };
  };

  // Calculer le temps de réalisation
  const getRealisationTime = (tache) => {
    if (!tache.dateFin || !tache.dateDebut) return null;
    
    const start = new Date(tache.dateDebut);
    const end = new Date(tache.dateFin);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (loading) {
    return (
      <div className="xtaches-employe-container">
        <div className="xloading">Chargement de vos tâches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="xtaches-employe-container">
        <div className="xerror-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="xtaches-employe-container">
      <div className="xtaches-header">
        <h2><FaTasks style={{ marginRight: "10px" }} /> Mes Tâches</h2>
        
        <div className="xtaches-filters">
          <select 
            value={statutFilter} 
            onChange={(e) => setStatutFilter(e.target.value)}
            className="xfilter-select"
          >
            <option value="">Tous les statuts</option>
            <option value="en_cours">En Cours</option>
            <option value="terminé">Terminé</option>
          </select>
          
          <button 
            onClick={() => setStatutFilter("")} 
            className="xbtn-reset"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {taches.length === 0 ? (
        <div className="xno-taches">
          <FaTasks size={50} color="#6c757d" />
          <h3>Aucune tâche trouvée</h3>
          <p>Vous n'avez aucune tâche assignée pour le moment.</p>
        </div>
      ) : (
        <div className="xtaches-grid">
          {taches.map((tache) => {
            const AssignationIcon = getAssignationIcon(tache);
            const daysInfo = getDaysRemaining(tache.dateLimite);
            const realisationTime = getRealisationTime(tache);
            const isDescriptionExpanded = expandedDescriptions[tache._id] || false;
            
            return (
              <div key={tache._id} className="xtache-card">
                <div className="xtache-header">
                  <div className="xtache-title-section">
                    <h3>{tache.titre}</h3>
                    <div className="xtache-meta">
                      <span className="xtache-assignation">
                        <AssignationIcon style={{ marginRight: "5px" }} />
                        {getAssignationText(tache)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="xtache-status-section">
                    {getStatutBadge(tache.statut)}
                    {getPrioriteBadge(tache.priorite)}
                  </div>
                </div>

                {/* Section description avec système Voir Plus */}
                <div className="xtache-description-section">
                  <div className={`xtache-description ${tache.description && tache.description.length > 80 && !isDescriptionExpanded ? 'compact' : 'expanded'}`}>
                    {tache.description}
                  </div>
                  
                  {tache.description && tache.description.length > 80 && (
                    <button 
                      className="xtache-read-more-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDescriptions(prev => ({
                          ...prev,
                          [tache._id]: !prev[tache._id]
                        }));
                      }}
                    >
                      {isDescriptionExpanded ? (
                        <>▲ Voir moins</>
                      ) : (
                        <>▼ Voir plus</>
                      )}
                    </button>
                  )}
                </div>

                <div className="xtache-details">
                  <div className="xdetail-item">
                    <FaCalendar className="xdetail-icon" />
                    <div className="xdetail-content">
                      <label>Date limite</label>
                      <div className="xdetail-value">
                        {new Date(tache.dateLimite).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className={`xdetail-subvalue ${daysInfo.class}`}>
                        {daysInfo.text}
                      </div>
                    </div>
                  </div>

                  <div className="xdetail-item">
                    <FaExclamationTriangle className="xdetail-icon" />
                    <div className="xdetail-content">
                      <label>Priorité</label>
                      <div className="xdetail-value">
                        {getPrioriteBadge(tache.priorite)}
                      </div>
                      <div className="xdetail-subvalue">
                        {tache.priorite === 'urgente' && 'Action immédiate requise'}
                        {tache.priorite === 'haute' && 'À traiter rapidement'}
                        {tache.priorite === 'normale' && 'Priorité standard'}
                        {tache.priorite === 'basse' && 'Peut être planifié'}
                      </div>
                    </div>
                  </div>

                  {/* Afficher la date de fin si la tâche est terminée */}
                  {tache.statut === 'terminé' && tache.dateFin && (
                    <div className="xdetail-item">
                      <FaFlagCheckered className="xdetail-icon" />
                      <div className="xdetail-content">
                        <label>Terminée le</label>
                        <div className="xdetail-value">
                          {new Date(tache.dateFin).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        {realisationTime && (
                          <div className="xdetail-subvalue success">
                            Réalisée en {realisationTime} jour(s)
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions selon le statut - UNIQUEMENT "Marquer comme terminé" */}
                {tache.statut === 'en_cours' && (
                  <div className="xtache-actions">
                    <button 
                      onClick={() => openConfirmationModal(tache)}
                      className="xbtn btn-success"
                    >
                      <FaCheck style={{ marginRight: "5px" }} /> Marquer comme terminé
                    </button>
                  </div>
                )}

                <div className="xtache-footer">
                  <span className="xtache-date">
                    Créée le {new Date(tache.createdAt).toLocaleDateString()}
                  </span>
                  {tache.statut === 'annulé' && (
                    <span className="xtache-annule-info">
                      • Tâche annulée par le RH
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Statistiques */}
      {taches.length > 0 && (
        <div className="xtaches-stats">
          <div className="xstat-card">
            <h4>Total</h4>
            <div className="xstat-number">{taches.length}</div>
          </div>
          <div className="xstat-card">
            <h4>En Cours</h4>
            <div className="xstat-number stat-en-cours">
              {taches.filter(t => t.statut === 'en_cours').length}
            </div>
          </div>
          <div className="xstat-card">
            <h4>Terminé</h4>
            <div className="xstat-number stat-termine">
              {taches.filter(t => t.statut === 'terminé').length}
            </div>
          </div>
          <div className="xstat-card">
            <h4>En Retard</h4>
            <div className="xstat-number stat-retard">
              {taches.filter(t => {
                const today = new Date();
                const limitDate = new Date(t.dateLimite);
                return t.statut === 'en_cours' && limitDate < today;
              }).length}
            </div>
          </div>
        </div>
      )}

      {/* Information pour l'employé */}
      <div className="xtaches-info">
        <p>
          <strong>Information :</strong> Vous pouvez uniquement marquer vos tâches comme terminées. 
          Pour toute modification, annulation ou réactivation, veuillez contacter le service RH.
        </p>
      </div>

      {/* Modal de confirmation */}
      {showModal && tacheToComplete && (
        <div className="xmodal-overlay">
          <div className="xmodal confirmation-modal">
            <div className="xmodal-header">
              <FaCheck className="xsuccess-icon" />
              <h3>Confirmer l'achèvement</h3>
              <button 
                className="xbtn-close-modal" 
                onClick={closeConfirmationModal}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="xmodal-body">
              <p>Êtes-vous sûr d'avoir terminé cette tâche ?</p>
              
              <div className="xtache-confirmation-details">
                <div className="xconfirmation-item">
                  <strong>Tâche :</strong> {tacheToComplete.titre}
                </div>
                <div className="xconfirmation-item">
                  <strong>Description :</strong> {tacheToComplete.description}
                </div>
                <div className="xconfirmation-item">
                  <strong>Date limite :</strong> {new Date(tacheToComplete.dateLimite).toLocaleDateString('fr-FR')}
                </div>
                <div className="xconfirmation-item">
                  <strong>Priorité :</strong> {getPrioriteBadge(tacheToComplete.priorite)}
                </div>
                <div className="xconfirmation-item highlight">
                  <strong>Date d'achèvement :</strong> {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              <div className="xwarning-message">
                ⚠️ Cette action est définitive. La date d'achèvement sera enregistrée automatiquement.
              </div>
            </div>
            
            <div className="xmodal-footer">
              <button 
                className="xbtn btn-cancel" 
                onClick={closeConfirmationModal}
              >
                Annuler
              </button>
              <button 
                className="xbtn btn-confirm" 
                onClick={confirmCompletion}
              >
                <FaCheck style={{ marginRight: "5px" }} /> Confirmer l'achèvement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TachesEmploye;