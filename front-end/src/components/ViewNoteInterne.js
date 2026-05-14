import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../components/ViewNoteInterne.css";

import { FaArrowLeft, FaEdit, FaTrash, FaCalendarAlt, FaUsers, FaEye , FaExclamationTriangle } from "react-icons/fa";

const ViewNoteInterne = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = () => {
    setLoading(true);
    axios
      .get(`http://localhost:5050/notes-internes/${id}`)
      .then((res) => {
        setNote(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement de la note:", err);
        setLoading(false);
      });
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setIsDeleting(false);
  };

  const confirmDelete = () => {
    setIsDeleting(true);
    
    axios
      .delete(`http://localhost:5050/notes-internes/${id}`)
      .then(() => {
        navigate("/admin/notes-internes");
      })
      .catch((err) => {
        console.error("Erreur lors de la suppression :", err);
        alert("Erreur lors de la suppression de la note");
        closeDeleteModal();
      });
  };

  if (loading) {
    return (
      <div className="view-note-container">
        <div className="loading-spinner-large">Chargement...</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="view-note-container">
        <div className="error-message">
          <h2>Note non trouvée</h2>
          <p>La note que vous recherchez n'existe pas ou a été supprimée.</p>
          <Link to="/admin/notes-internes" className="btssn btn-primary">
            <FaArrowLeft style={{ marginRight: "8px" }} />
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="vsiew-note-container">
      {/* En-tête avec boutons d'action */}
      <div className="notse-header">
        <div className="hesader-left">
          <Link to="/admin/notes-internes" className="btssn btn-back">
            <FaArrowLeft style={{ marginRight: "8px" }} />
            Retour
          </Link>
          <h1>{note.titre}</h1>
        </div>
        
      
      </div>

      {/* Métadonnées de la note */}
      <div className="notsse-metadata">
        <div className="metsadata-item">
          <FaCalendarAlt className="metadasta-icon" />
          <div className="metadatsa-content">
            <span className="metasdata-label">Date de publication</span>
            <span className="metasdata-value">
              {new Date(note.datePublication).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        <div className="metsadata-item">
          <FaUsers className="mestadata-icon" />
          <div className="metadatsa-content">
            <span className="metadsata-label">Visibilité</span>
            <span className="metadasta-value">
              {note.estVisiblePourTous ? (
                <span className="vissibility-badge visibility-all">
                  🌍 Visible pour tous les départements
                </span>
              ) : (
                <span className="visisbility-badge visibility-targeted">
                  🎯 Réservée à certains départements
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="metasdata-item">
          <FaEye className="metssadata-icon" />
          <div className="metadsata-content">
            <span className="metsadata-label">Départements cibles</span>
            <span className="metasdata-value">
              {note.estVisiblePourTous ? (
                "Tous les départements"
              ) : (
                <div className="departsements-list">
                  {note.departements.map((departement, index) => (
                    <span key={departement._id} className="deparstement-tag">
                      {departement.nom}
                    </span>
                  ))}
                </div>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu de la note */}
      <div className="noste-content-section">
        <h2>Contenu de la note</h2>
        <div className="noste-content">
          {note.contenu.split('\n').map((paragraph, index) => (
            paragraph.trim() ? (
              <p key={index}>{paragraph}</p>
            ) : (
              <br key={index} />
            )
          ))}
        </div>
      </div>

      {/* Informations de création */}
      <div className="notse-footer">
        <div className="crseation-info">
          <span>Note créée le {new Date(note.createdAt).toLocaleDateString('fr-FR')}</span>
          {note.updatedAt !== note.createdAt && (
            <span> • Dernière modification le {new Date(note.updatedAt).toLocaleDateString('fr-FR')}</span>
          )}
        </div>
      </div>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="mssodal-overlay">
          <div className="mosdal delete-modal">
            <div className="mosdal-header">
              <FaExclamationTriangle className="warning-icon" />
              <h3>Confirmer la suppression</h3>
            </div>
            
            <div className="modassl-body">
              <p>Êtes-vous sûr de vouloir supprimer cette note ?</p>
              
              <div className="notsse-preview">
                <div className="presview-item">
                  <strong>Titre :</strong> {note.titre}
                </div>
                <div className="presview-item">
                  <strong>Date de publication :</strong> 
                  {new Date(note.datePublication).toLocaleDateString()}
                </div>
              </div>
              
              <div className="warnssing-message">
                ⚠️ Cette action est irréversible et supprimera définitivement la note.
              </div>
            </div>
            
            <div className="mosdal-footer">
              <button 
                className="btsn btn-cancel" 
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button 
                className="btsn btn-confirm-delete" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="loadsing-spinner"></div>
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

export default ViewNoteInterne;