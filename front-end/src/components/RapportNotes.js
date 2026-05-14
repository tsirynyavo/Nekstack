import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../components/RapportNotes.css";

const RapportNotes = () => {
  const navigate = useNavigate();
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [departements, setDepartements] = useState([]);
  const [filtres, setFiltres] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    departement: "tous"
  });

  useEffect(() => {
    chargerDepartements();
    genererRapport();
  }, []);

  const chargerDepartements = async () => {
    try {
      const response = await axios.get("http://localhost:5050/departements");
      setDepartements(response.data);
    } catch (error) {
      console.error("Erreur chargement départements:", error);
    }
  };

  const genererRapport = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5050/notes-internes/rapport", {
        params: filtres
      });
      setRapport(response.data);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la génération du rapport");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltreChange = (e) => {
    setFiltres({
      ...filtres,
      [e.target.name]: e.target.value
    });
  };

  const handleRetour = () => {
    navigate(-1);
  };

  const exporterCSV = () => {
    if (!rapport) return;
    
    const BOM = '\uFEFF';
    let csvContent = BOM + "Titre;Contenu;Date publication;Départements;Visibilité\n";
    
    rapport.notes.forEach(note => {
      const titre = `"${note.titre.replace(/"/g, '""')}"`;
      const contenu = `"${note.contenu.replace(/"/g, '""').substring(0, 100)}..."`;
      const datePub = new Date(note.datePublication).toLocaleDateString('fr-FR');
      const deps = note.estVisiblePourTous 
        ? "Tous" 
        : note.departements.map(dep => dep.nom).join(", ");
      const visibilite = note.estVisiblePourTous ? "Tous" : "Ciblée";
      
      csvContent += `${titre};${contenu};${datePub};${deps};${visibilite}\n`;
    });
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `rapport-notes-${filtres.startDate}-${filtres.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="rapport-notes-container">
      {/* En-tête avec filtres */}
      <div className="rapport-header">
        <div className="header-top">
          <button onClick={handleRetour} className="retour-btn">
            ← Retour
          </button>
          <h1>📊 Rapport des Notes Internes</h1>
        </div>
        
        <div className="filtres-section">
          <div className="filtre-group">
            <label>Date de début :</label>
            <input
              type="date"
              name="startDate"
              value={filtres.startDate}
              onChange={handleFiltreChange}
            />
          </div>
          
          <div className="filtre-group">
            <label>Date de fin :</label>
            <input
              type="date"
              name="endDate"
              value={filtres.endDate}
              onChange={handleFiltreChange}
            />
          </div>
          
          <div className="filtre-group">
            <label>Département :</label>
            <select
              name="departement"
              value={filtres.departement}
              onChange={handleFiltreChange}
            >
              <option value="tous">Tous les départements</option>
              {departements.map(dep => (
                <option key={dep._id} value={dep._id}>
                  {dep.nom}
                </option>
              ))}
            </select>
          </div>
          
          <div className="action-buttons">
           
            
            <button 
              onClick={exporterCSV}
              disabled={!rapport}
              className="export-btn"
            >
              Exporter CSV
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      {rapport && (
        <div className="stats-globales">
          <div className="stat-card">
            <h3>Total Notes</h3>
            <p className="stat-number">{rapport.totalNotes}</p>
          </div>
          
          <div className="stat-card">
            <h3>Notes pour Tous</h3>
            <p className="stat-number">{rapport.notesPourTous}</p>
          </div>
          
          <div className="stat-card">
            <h3>Notes Ciblées</h3>
            <p className="stat-number">{rapport.notesCiblees}</p>
          </div>
          
          <div className="stat-card">
            <h3>Période</h3>
            <p className="stat-period">{rapport.periode}</p>
          </div>
        </div>
      )}

      {/* Statistiques par département */}
      {rapport && rapport.statsParDepartement.length > 0 && (
        <div className="stats-departements">
          <h2>Répartition par Département</h2>
          <div className="departements-grid">
            {rapport.statsParDepartement.map((stat, index) => (
              <div key={index} className="departement-stat">
                <span className="departement-nom">{stat.nom}</span>
                <span className="departement-count">{stat.count} note(s)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tableau détaillé des notes */}
      {rapport && (
        <div className="tableau-notes">
          <h2>Détail des Notes ({rapport.notes.length})</h2>
          
          <div className="table-container">
            <table className="notes-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Contenu</th>
                  <th>Date Publication</th>
                  <th>Départements</th>
                  <th>Visibilité</th>
                </tr>
              </thead>
              <tbody>
                {rapport.notes.map((note) => (
                  <tr key={note._id}>
                    <td className="note-titre">
                      <strong>{note.titre}</strong>
                    </td>
                    <td className="note-contenu">
                      {note.contenu.length > 100 
                        ? `${note.contenu.substring(0, 100)}...` 
                        : note.contenu
                      }
                    </td>
                    <td className="note-date">
                      {formatDate(note.datePublication)}
                    </td>
                    <td className="note-departements">
                      {note.estVisiblePourTous ? (
                        <span className="badge-tous">Tous</span>
                      ) : (
                        <div className="departements-list">
                          {note.departements.map(dep => (
                            <span key={dep._id} className="departement-tag">
                              {dep.nom}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="note-visibilite">
                      <span className={`visibilite-badge ${note.estVisiblePourTous ? 'tous' : 'ciblee'}`}>
                        {note.estVisiblePourTous ? "🌍 Tous" : "🎯 Ciblée"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!rapport && !loading && (
        <div className="no-data">
          <p>Configurez les filtres et générez le rapport</p>
        </div>
      )}
    </div>
  );
};

export default RapportNotes;