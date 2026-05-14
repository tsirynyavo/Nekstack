import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import { FaEdit, FaTrash, FaEye, FaStickyNote, FaPlus, FaExclamationTriangle } from "react-icons/fa";
import "../components/ListNoteInterne.css";
const ListNoteInterne = () => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 5;
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchNotes(page);
  }, [page]);

  const fetchNotes = (pageNumber = 1) => {
    axios
      .get("http://localhost:5050/notes-internes", {
        params: {
          page: pageNumber,
          limit,
          search: searchTerm
        }
      })
      .then((res) => {
        setNotes(res.data.notes);
        setPage(res.data.page);
        setPages(res.data.pages);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchNotes(1);
  }, [searchTerm]);

  const openDeleteModal = (note) => {
    setNoteToDelete(note);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setNoteToDelete(null);
    setIsDeleting(false);
  };

  const confirmDelete = () => {
    if (!noteToDelete) return;
    
    setIsDeleting(true);
    
    axios
      .delete(`http://localhost:5050/notes-internes/${noteToDelete._id}`)
      .then(() => {
        fetchNotes(page);
        closeDeleteModal();
      })
      .catch((err) => {
        console.error("Erreur lors de la suppression :", err);
        alert("Erreur lors de la suppression de la note");
        closeDeleteModal();
      });
  };

  const resetFilters = () => {
    setSearchTerm("");
  };

  return (
    <div className="ndotes-list-header">
      <h2>Notes Internes</h2>

      <div className="sedarch-box">
        <input
          type="text"
          placeholder="Rechercher par titre ou contenu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
    
      <button onClick={resetFilters} className="btcn btn-reset" style={{ margin: "10px 0" }}>
        Réinitialiser
      </button>
  </div>

      <Link to="/admin/notes-internes/add">
        <button className="bctn btn-add" style={{ marginBottom: "15px" }}>
          <FaPlus style={{ marginRight: "6px" }} /> Nouvelle Note Interne
        </button>
      </Link>

      <table
        border="1"
        cellPadding="5"
        style={{ borderCollapse: "collapse", marginTop: "15px", width: "100%" }}
      >
        <thead>
          <tr>
            <th>Titre</th>
            <th>Contenu</th>
            <th>Départements cibles</th>
            <th>Date publication</th>
           
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => (
            <tr key={note._id}>
              <td><strong>{note.titre}</strong></td>
              <td style={{ maxWidth: "300px" }}>
                {note.contenu.length > 100 
                  ? `${note.contenu.substring(0, 100)}...` 
                  : note.contenu
                }
              </td>
              <td>
                {note.estVisiblePourTous ? (
                  <span style={{ color: "green", fontWeight: "bold" }}>Tous les départements</span>
                ) : (
                  note.departements.map(dep => dep.nom).join(", ")
                )}
              </td>
              <td>{new Date(note.datePublication).toLocaleDateString()}</td>
           
              <td>
                <Link to={`/admin/notes-internes/view/${note._id}`}>
                  <button className="bccctn btn-view">
                    <FaEye style={{ marginRight: "5px" }} /> Voir
                  </button>
                </Link>
                <Link to={`/admin/notes-internes/edit/${note._id}`}>
                  <button className="bctn btn-modify" style={{ margin: "0 5px" }}>
                    <FaEdit style={{ marginRight: "5px" }} /> Modifier
                  </button>
                </Link>
                <button 
                  className="btcn btn-delete" 
                  onClick={() => openDeleteModal(note)}
                >
                  <FaTrash style={{ marginRight: "5px" }} /> Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "15px" }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</button>
        <span style={{ margin: "0 10px" }}> Page {page} sur {pages} </span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Suivant</button>
      </div>

      {showDeleteModal && (
        <div className="modcal-overlay">
          <div className="deccclete-modal">
            <div className="mocdal-header">
              <FaExclamationTriangle className="wccarning-icon" />
              <h3>Confirmer la suppression</h3>
            </div>
            
            <div className="modcal-body">
              <p>Êtes-vous sûr de vouloir supprimer cette note ?</p>
              
              {noteToDelete && (
                <div className="notce-preview">
                  <div className="prevciew-item">
                    <strong>Titre :</strong> {noteToDelete.titre}
                  </div>
                  <div className="prevciew-item">
                    <strong>Contenu :</strong> 
                    {noteToDelete.contenu.length > 100 
                      ? `${noteToDelete.contenu.substring(0, 100)}...` 
                      : noteToDelete.contenu
                    }
                  </div>
                  <div className="previcew-item">
                    <strong>Date de publication :</strong> 
                    {new Date(noteToDelete.datePublication).toLocaleDateString()}
                  </div>
                </div>
              )}
              
              <div className="warning-messccage">
                ⚠️ Cette action est irréversible et supprimera définitivement la note.
              </div>
            </div>
            
            <div className="modal-foocter">
              <button 
                className="bcstn btn-cancel" 
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
                    <div className="loacsding-spinner"></div>
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

export default ListNoteInterne;