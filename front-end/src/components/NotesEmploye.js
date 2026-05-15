import React, { useState, useEffect } from "react";
import axios from "axios";


import { FaStickyNote, FaCalendarAlt, FaUsers, FaSearch } from "react-icons/fa";
import "../components/NotesEmploye.css";
const NotesEmploye = ({ employeId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [employeId]);

  const fetchNotes = () => {
    setLoading(true);
    axios
      .get(`http://localhost:5050/notes-internes/employe/${employeId}`)
      .then((res) => {
        setNotes(res.data.notes);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des notes:", err);
        setLoading(false);
      });
  };

  const openNoteDetail = (note) => {
    setSelectedNote(note);
    setShowNoteModal(true);
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setSelectedNote(null);
  };

  // Filtrer les notes selon la recherche
  const filteredNotes = notes.filter(note =>
    note.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.contenu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="notes-employe-container">
        <div className="loading-spinner">Chargement des notes...</div>
      </div>
    );
  }

  return (
    <div className="xnotes-employe-container">
      <div className="xnotes-header">
        <h2>
          <FaStickyNote style={{ marginRight: "10px" }} />
          Notes Internes
        </h2>
        <p className="xnotes-subtitle">
          Consultez les notes et annonces destinées à votre département
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="xnotes-search">
        <div className="xsearch-box">
          <FaSearch className="xsearch-icon" />
          <input
            type="text"
            placeholder="Rechercher dans les notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="xnotes-count">
          {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} trouvée{filteredNotes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des notes */}
      <div className="xnotes-list">
        {filteredNotes.length === 0 ? (
          <div className="xno-notes">
            {searchTerm ? (
              <p>Aucune note ne correspond à votre recherche.</p>
            ) : (
              <p>Aucune note disponible pour le moment.</p>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note._id} className="xnote-card" onClick={() => openNoteDetail(note)}>
              <div className="xnote-header">
                <h3 className="xnote-title">{note.titre}</h3>
                <span className={`xvisibility-badge ${note.estVisiblePourTous ? 'visibility-all' : 'visibility-targeted'}`}>
                  {note.estVisiblePourTous ? "🌍 Tous" : "🎯 Ciblée"}
                </span>
              </div>
              
              <div className="xnote-preview">
                {note.contenu.length > 150 
                  ? `${note.contenu.substring(0, 150)}...` 
                  : note.contenu
                }
              </div>
              
              <div className="xnote-footer">
                <div className="xnote-meta">
                  <span className="xmeta-item">
                    <FaCalendarAlt style={{ marginRight: "5px" }} />
                    {new Date(note.datePublication).toLocaleDateString('fr-FR')}
                  </span>
                  {!note.estVisiblePourTous && (
                    <span className="xmeta-item">
                      <FaUsers style={{ marginRight: "5px" }} />
                      {note.departements.length} département{note.departements.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="xread-more">Cliquer pour lire →</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de détail de note */}
      {showNoteModal && selectedNote && (
        <div className="xmodal-overlay" onClick={closeNoteModal}>
          <div className="xmodal note-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="xmodal-header">
              <h3>{selectedNote.titre}</h3>
              <button className="xbtn-close" onClick={closeNoteModal}>×</button>
            </div>
            
            <div className="xmodal-body">
              <div className="xnote-metadata">
                <div className="xmetadata-row">
                  <span className="xmetadata-label">
                    <FaCalendarAlt style={{ marginRight: "8px" }} />
                    Publiée le {new Date(selectedNote.datePublication).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="xmetadata-row">
                  <span className={`xvisibility-badge ${selectedNote.estVisiblePourTous ? 'visibility-all' : 'visibility-targeted'}`}>
                    {selectedNote.estVisiblePourTous ? "🌍 Visible pour tous les départements" : "🎯 Réservée à certains départements"}
                  </span>
                </div>

                {!selectedNote.estVisiblePourTous && (
                  <div className="xmetadata-row">
                    <span className="xmetadata-label">
                      <FaUsers style={{ marginRight: "8px" }} />
                      Destinée aux départements :
                    </span>
                    <div className="xdepartements-list">
                      {selectedNote.departements.map((departement) => (
                        <span key={departement._id} className="xdepartement-tag">
                          {departement.nom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="xnote-content">
                {selectedNote.contenu.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? (
                    <p key={index}>{paragraph}</p>
                  ) : (
                    <br key={index} />
                  )
                ))}
              </div>
            </div>
            
            <div className="xmodal-footer">
              <button className="xbtn btn-primary" onClick={closeNoteModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesEmploye;