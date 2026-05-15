import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaEye, FaTasks, FaPlus, FaExclamationTriangle, FaCalendarCheck } from "react-icons/fa";
import "../components/ListTaches.css";

const ListTaches = () => {
  const [taches, setTaches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statutFilter, setStatutFilter] = useState("");
  const limit = 5;
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tacheToDelete, setTacheToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTaches(page);
  }, [page, statutFilter]);

  const fetchTaches = (pageNumber = 1) => {
    axios
      .get("http://localhost:5050/taches", {
        params: {
          page: pageNumber,
          limit,
          search: searchTerm,
          statut: statutFilter
        }
      })
      .then((res) => {
        setTaches(res.data.taches);
        setPage(res.data.page);
        setPages(res.data.pages);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTaches(1);
  }, [searchTerm, statutFilter]);

  const openDeleteModal = (tache) => {
    setTacheToDelete(tache);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTacheToDelete(null);
    setIsDeleting(false);
  };

  const confirmDelete = () => {
    if (!tacheToDelete) return;
    
    setIsDeleting(true);
    
    axios
      .delete(`http://localhost:5050/taches/${tacheToDelete._id}`)
      .then(() => {
        fetchTaches(page);
        closeDeleteModal();
      })
      .catch((err) => {
        console.error("Erreur lors de la suppression :", err);
        alert("Erreur lors de la suppression de la tâche");
        closeDeleteModal();
      });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatutFilter("");
  };

  const getStatutBadge = (statut) => {
    const badges = {
      'en_cours': { class: 'statut-en-cours', text: 'En Cours' },
      'terminé': { class: 'statut-termine', text: 'Terminé' },
      'annulé': { class: 'statut-annule', text: 'Annulé' }
    };
    
    const badge = badges[statut] || { class: 'statut-default', text: statut };
    return <span className={`statut-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getPrioriteBadge = (priorite) => {
    const badges = {
      'urgente': { class: 'priorite-normale', text: 'Urgente' },
      'haute': { class: 'priorite-normale', text: 'Haute' },
      'normale': { class: 'priorite-normale', text: 'Normale' },
      'basse': { class: 'priorite-normale', text: 'Basse' }
    };
    
    const badge = badges[priorite] || { class: 'priorite-default', text: priorite };
    return <span className={`priorite-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getAssignationText = (tache) => {
    if (tache.assignationType === 'personne' && tache.employe_id) {
      return `${tache.employe_id.prenom} ${tache.employe_id.nom}`;
    }
    if (tache.assignationType === 'departement' && tache.departement_id) {
      return `Département ${tache.departement_id.nom}`;
    }
    return "Non assigné";
  };

  // Fonction pour calculer le temps de réalisation
  const getRealisationTime = (tache) => {
    if (!tache.dateFin || !tache.dateDebut) return null;
    
    const start = new Date(tache.dateDebut);
    const end = new Date(tache.dateFin);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Fonction pour formater la date de fin
  const formatDateFin = (tache) => {
    if (!tache.dateFin) return "-";
    
    return (
      <div className="date-fin-conddtainer">
        <div className="date-fdin">
          {new Date(tache.dateFin).toLocaleDateString()}
        </div>
        {tache.statut === 'terminé' && (
          <div className="realisdation-time">
            {getRealisationTime(tache) !== null && (
              <span className="temdps-realisation">
                ({getRealisationTime(tache)} jour(s))
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="taches-list-hedader">
      <h2><FaTasks style={{ marginRight: "10px" }} /> Gestion des Tâches</h2>

      <div className="filters-contdainer">
        <div className="searchd-box">
          <input
            type="text"
            placeholder="Rechercher par titre ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dbox">
          <select 
            value={statutFilter} 
            onChange={(e) => setStatutFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="en_cours">En Cours</option>
            <option value="terminé">Terminé</option>
            <option value="annulé">Annulé</option>
          </select>
        </div>

        <button onClick={resetFilters} className="btn btn-rddeset">
          Réinitialiser
        </button>
      </div>

      <Link to="/admin/taches/add">
        <button className="btn btn-adddd" style={{ marginBottom: "15px" }}>
          <FaPlus style={{ marginRight: "6px" }} /> Nouvelle Tâche
        </button>
      </Link>

      <table className="taches-tdable">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Assignation</th>
            <th>Priorité</th>
            <th>Date Limite</th>
            <th>Date Début</th>
            <th>Date Fin</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {taches.map((tache) => (
            <tr key={tache._id}>
              <td><strong>{tache.titre}</strong></td>
              <td className="descripdtion-cell">
                {tache.description.length > 100 
                  ? `${tache.description.substring(0, 100)}...` 
                  : tache.description
                }
              </td>
              <td>{getAssignationText(tache)}</td>
              <td>{getPrioriteBadge(tache.priorite)}</td>
              <td>
                <div className="datde-cell">
                  {new Date(tache.dateLimite).toLocaleDateString()}
                  {tache.statut === 'en_cours' && new Date(tache.dateLimite) < new Date() && (
                    <span className="retardd-indicator">⚠️ Retard</span>
                  )}
                </div>
              </td>
              <td>
                {tache.dateDebut ? new Date(tache.dateDebut).toLocaleDateString() : "-"}
              </td>
              <td>
                {formatDateFin(tache)}
              </td>
              <td>{getStatutBadge(tache.statut)}</td>
              <td className="actions-cedll">
                <Link to={`/admin/taches/view/${tache._id}`}>
                  <button className="btn bddtn-view">
                    <FaEye style={{ marginRight: "5px" }} /> Voir
                  </button>
                </Link>
                 {/* Rendre le bouton Modifier désactivé si statut est "terminé" */}
  {tache.statut !== 'terminé' ? (
    <Link to={`/admin/taches/edit/${tache._id}`}>
      <button className="btdn btn-modify" style={{ margin: "0 5px" }}>
       Modifier
      </button>
    </Link>
  ) : (
    <button 
      className="btn btn-modidfy disabled" 
      style={{ margin: "0 5px" }}
      disabled
      title="Impossible de modifier une tâche terminée"
    >
     ........... 
    </button>
  )}
  
                <button 
                  className="btn bddtn-delete" 
                  onClick={() => openDeleteModal(tache)}
                >
                  <FaTrash style={{ marginRight: "5px" }} /> Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {taches.length === 0 && (
        <div className="no-dadta">
          <p>Aucune tâche trouvée</p>
        </div>
      )}

      <div className="paddgination">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</button>
        <span> Page {page} sur {pages} </span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Suivant</button>
      </div>

      {showDeleteModal && (
        <div className="modal-ovedrlay">
          <div className="modal deddlete-modal">
            <div className="modal-header">
              <FaExclamationTriangle className="warning-icon" />
              <h3>Confirmer la suppression</h3>
            </div>
            
            <div className="moddal-body">
              <p>Êtes-vous sûr de vouloir supprimer cette tâche ?</p>
              
              {tacheToDelete && (
                <div className="tached-preview">
                  <div className="prevdiew-item">
                    <strong>Titre :</strong> {tacheToDelete.titre}
                  </div>
                  <div className="previewd-item">
                    <strong>Assignation :</strong> {getAssignationText(tacheToDelete)}
                  </div>
                  <div className="prevziew-item">
                    <strong>Date limite :</strong> 
                    {new Date(tacheToDelete.dateLimite).toLocaleDateString()}
                  </div>
                  {tacheToDelete.dateFin && (
                    <div className="prezview-item">
                      <strong>Date de fin :</strong> 
                      {new Date(tacheToDelete.dateFin).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
              
              <div className="warning-messazge">
                ⚠️ Cette action est irréversible.
              </div>
            </div>
            
            <div className="modal-foozter">
              <button 
                className="btn btn-czancel" 
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button 
                className="btn btn-confirm-delezte" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="loading-spiznner"></div>
                    Suppression...
                  </>
                ) : (
                  "Confirmer la suppression"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListTaches;