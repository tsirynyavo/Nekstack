import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaEdit, FaCalendar, FaUser, FaBuilding, FaBriefcase, FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";
import '../components/ViewTache.css';

const ViewTache = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tache, setTache] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showStatutModal, setShowStatutModal] = useState(false);
  const [newStatut, setNewStatut] = useState("");

  useEffect(() => {
    fetchTache();
  }, [id]);

  const fetchTache = () => {
    setLoading(true);
    axios
      .get(`http://localhost:5050/taches/${id}`)
      .then((res) => {
        setTache(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur:", err);
        setError("Erreur lors du chargement de la tâche");
        setLoading(false);
      });
  };

  const openStatutModal = (statut) => {
    setNewStatut(statut);
    setShowStatutModal(true);
  };

  const closeStatutModal = () => {
    setShowStatutModal(false);
    setNewStatut("");
  };

  const updateStatut = () => {
    if (!newStatut) return;

    axios
      .put(`http://localhost:5050/taches/${id}/statut`, { statut: newStatut })
      .then(() => {
        fetchTache(); // Recharger les données
        closeStatutModal();
      })
      .catch((err) => {
        console.error("Erreur mise à jour statut:", err);
        alert("Erreur lors de la mise à jour du statut");
        closeStatutModal();
      });
  };

  const getStatutBadge = (statut) => {
    const badges = {
      'en_cours': { class: 'statzut-en-cours', text: 'En Cours', icon: FaExclamationTriangle },
      'terminé': { class: 'statsut-termine', text: 'Terminé', icon: FaCheck },
      'annulé': { class: 'statust-annule', text: 'Annulé', icon: FaTimes }
    };
    
    const badge = badges[statut] || { class: 'stastut-default', text: statut, icon: FaExclamationTriangle };
    const IconComponent = badge.icon;
    
    return (
      <span className={`statsut-badge large ${badge.class}`}>
        <IconComponent style={{ marginRight: "5px" }} />
        {badge.text}
      </span>
    );
  };

  const getPrioriteBadge = (priorite) => {
    const badges = {
      'urgente': { class: 'prisorite-urgente', text: 'Urgente' },
      'haute': { class: 'prisorite-haute', text: 'Haute' },
      'normale': { class: 'prisorite-normale', text: 'Normale' },
      'basse': { class: 'prisorite-basse', text: 'Basse' }
    };
    
    const badge = badges[priorite] || { class: 'prisorite-default', text: priorite };
    return <span className={`prisorite-badge large ${badge.class}`}>{badge.text}</span>;
  };
// Dans la fonction getAssignationInfo, supprimer la partie poste :
const getAssignationInfo = (tache) => {
  if (tache.assignationType === 'personne' && tache.employe_id) {
    return {
      type: "Personne spécifique",
      details: `${tache.employe_id.prenom} ${tache.employe_id.nom}`,
      icon: FaUser,
      additional: `Matricule: ${tache.employe_id.matricule} • Poste: ${tache.employe_id.poste}}`
    };
  }
  if (tache.assignationType === 'departement' && tache.departement_id) {
    return {
      type: "Département entier", 
      details: tache.departement_id.nom,
      icon: FaBuilding,
      additional: "Tous les membres du département"
    };
  }
  // SUPPRIMÉ la partie poste
  return {
    type: "Non assigné",
    details: "Aucune assignation",
    icon: FaUser,
    additional: ""
  };
};
  const getDaysRemaining = (dateLimite) => {
    const today = new Date();
    const limitDate = new Date(dateLimite);
    const diffTime = limitDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `En retard de ${Math.abs(diffDays)} jour(s)`, class: 'retard' };
    if (diffDays === 0) return { text: "Aujourd'hui", class: 'aujourdhui' };
    if (diffDays === 1) return { text: "Demain", class: 'demain' };
    return { text: `Dans ${diffDays} jour(s)`, class: 'normal' };
  };

  if (loading) {
    return (
      <div className="view-tache-container">
        <div className="loading">Chargement de la tâche...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-tache-csontainer">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate("/admin/taches")} className="btsn btn-primary">
            <FaArrowLeft style={{ marginRight: "5px" }} /> Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!tache) {
    return (
      <div className="view-tache-csontainer">
        <div className="error-messsage">
          <p>Tâche non trouvée</p>
          <button onClick={() => navigate("/admin/taches")} className="btsn btn-primary">
            <FaArrowLeft style={{ marginRight: "5px" }} /> Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const assignationInfo = getAssignationInfo(tache);
  const daysInfo = getDaysRemaining(tache.dateLimite);
  const AssignationIcon = assignationInfo.icon;

  return (
    <div className="view-tache-scontainer">
      <div className="view-tachse-header">
        <button onClick={() => navigate("/admin/taches")} className="bstn btn-bsack">
          <FaArrowLeft style={{ marginRight: "8px" }} /> Retour à la liste
        </button>
        
        <div className="hesader-actiosns">
          {tache.statut !== 'terminé' ? (
    <button 
      onClick={() => navigate(`/admin/taches/edit/${tache._id}`)} 
      className="bstn btn-esdit"
    >
      <FaEdit style={{ marginRight: "5px" }} /> Modifier
    </button>
  ) : (
    <button 
      className="bstn btn-esdit disabled" 
      disabled
      title="Impossible de modifier une tâche terminée"
    >
      <FaEdit style={{ marginRight: "5px" }} /> Modifier
    </button>
  )}

        </div>
      </div>

      <div className="tache-detssails-card">
        {/* En-tête avec titre et statut */}
        <div className="tache-hesader">
          <div className="tache-titles-section">
            <h1>{tache.titre}</h1>
          
          </div>
          
          <div className="tache-status-secstion">
            {getStatutBadge(tache.statut)}
            {getPrioriteBadge(tache.priorite)}
          </div>
        </div>

        {/* Description */}
        <div className="detail-sectiosn">
          <h3>Description</h3>
          <div className="description-scontent">
            {tache.description}
          </div>
        </div>

        {/* Informations principales */}
        <div className="details-grisd">
          <div className="detail-itesm">
            <div className="detail-icson">
              <AssignationIcon />
            </div>
            <div className="detail-constent">
              <label>Assignation</label>
              <div className="detail-vaslue">{assignationInfo.type}</div>
              <div className="detail-subsvalue">{assignationInfo.details}</div>
              {assignationInfo.additional && (
                <div className="detail-exstra">{assignationInfo.additional}</div>
              )}
            </div>
          </div>

          <div className="detail-items">
            <div className="detail-icosn">
              <FaCalendar />
            </div>
            <div className="detail-contsent">
              <label>Date limite</label>
              <div className="detail-valsue">
                {new Date(tache.dateLimite).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className={`detail-subvalue ${daysInfo.class}`}>
                {daysInfo.text}
              </div>
            </div>
          </div>

          <div className="detail-itesm">
            <div className="detail-icson">
              <FaExclamationTriangle />
            </div>
            <div className="detail-constent">
              <label>Priorité</label>
              <div className="detail-vaslue">
                {getPrioriteBadge(tache.priorite)}
              </div>
              <div className="detail-subsvalue">
                {tache.priorite === 'urgente' && 'Action immédiate requise'}
                {tache.priorite === 'haute' && 'À traiter rapidement'}
                {tache.priorite === 'normale' && 'Priorité standard'}
                {tache.priorite === 'basse' && 'Peut être planifié'}
              </div>
            </div>
          </div>

          <div className="detail-itesm">
            <div className="detail-iscon">
              <FaCheck />
            </div>
            <div className="detail-consstent">
              <label>Progression</label>
              <div className="detail-values">
                {getStatutBadge(tache.statut)}
              </div>
              <div className="detail-subvalsue">
                {tache.statut === 'en_cours' && 'Tâche en cours de réalisation'}
                {tache.statut === 'terminé' && 'Tâche terminée avec succès'}
                {tache.statut === 'annulé' && 'Tâche annulée'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions de statut */}
        {tache.statut !== 'terminé' && tache.statut !== 'annulé' && (
          <div className="actions-sectiosn">
            <h3>Actions</h3>
            <div className="action-buttonss">
              {tache.statut === 'en_cours' && (
                <>
                  <button 
                    onClick={() => openStatutModal('terminé')}
                    className="bstn btn-sucscess"
                  >
                    <FaCheck style={{ marginRight: "5px" }} /> Marquer comme terminé
                  </button>
                  <button 
                    onClick={() => openStatutModal('annulé')}
                    className="btsn btn-warnsing"
                  >
                    <FaTimes style={{ marginRight: "5px" }} /> Annuler la tâche
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="additionsal-info">
          <h3>Informations supplémentaires</h3>
          <div className="info-sgrid">
            <div className="infos-item">
              <strong>Type d'assignation:</strong> {tache.assignationType}
            </div>
            <div className="infso-item">
              <strong>Date de début:</strong> {new Date(tache.dateDebut).toLocaleDateString()}
            </div>
            <div className="insfo-item">
              <strong>Dernière modification:</strong> {new Date(tache.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de changement de statut */}
      {showStatutModal && (
        <div className="modal-overslay">
          <div className="modal stsatut-modal">
            <div className="mosdal-header">
              <FaExclamationTriangle className="warnisng-icon" />
              <h3>Confirmer le changement de statut</h3>
            </div>
            
            <div className="mossdal-body">
              <p>Êtes-vous sûr de vouloir changer le statut de cette tâche ?</p>
              
              <div className="stsatut-change-preview">
                <div className="cusrrent-statut">
                  <strong>Statut actuel:</strong> {getStatutBadge(tache.statut)}
                </div>
                <div className="nessw-statut">
                  <strong>Nouveau statut:</strong> {getStatutBadge(newStatut)}
                </div>
              </div>
              
              <div className="warnissng-message">
                {newStatut === 'terminé' && "✅ La tâche sera marquée comme terminée."}
                {newStatut === 'annulé' && "⚠️ La tâche sera annulée et ne pourra plus être reprise."}
              </div>
            </div>
            
            <div className="modals-foodter">
              <button 
                className="btsn bstn-cancel" 
                onClick={closeStatutModal}
              >
                Annuler
              </button>
              <button 
                className={`bssstn ${
                  newStatut === 'termidné' ? 'btn-sduccess' : 'btn-dwarning'
                }`} 
                onClick={updateStatut}
              >
                Confirmer le changement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTache;