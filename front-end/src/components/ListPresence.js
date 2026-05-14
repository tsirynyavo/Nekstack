// Remplacer le composant ListePresence par ceci :
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../components/ListPresence.css";

const ListePresence = () => {
  const navigate = useNavigate();
  const [employes, setEmployes] = useState([]);
  const [allPresences, setAllPresences] = useState([]);
  const [filteredPresences, setFilteredPresences] = useState([]);
  const [joursFeries, setJoursFeries] = useState([]);
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [pointageLoading, setPointageLoading] = useState({}); // Pour gérer le loading par bouton
  const [modalOpen, setModalOpen] = useState(false);
const [selectedEmploye, setSelectedEmploye] = useState(null);
const [typePointageSelected, setTypePointageSelected] = useState("");
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [presenceToDelete, setPresenceToDelete] = useState(null);
const [heurePointage, setHeurePointage] = useState("");
const [message, setMessage] = useState("");

 const [statutFilter, setStatutFilter] = useState("actif");
  const [departementFilter, setDepartementFilter] = useState(""); // Filtre département
  const [departements, setDepartements] = useState([]); // Liste des départements
  const [currentPage, setCurrentPage] = useState(1); // Pagination
  const [itemsPerPage] = useState(5); // Nombre d'employés par page

  // Navigation jour
  const prevDay = () => setCurrentDate(prev => { const d = new Date(prev); d.setDate(d.getDate()-1); return d; });
  const nextDay = () => setCurrentDate(prev => { const d = new Date(prev); d.setDate(d.getDate()+1); return d; });
  const goToToday = () => setCurrentDate(new Date());
  const isToday = (date) => new Date(date).toDateString() === new Date().toDateString();

  // Fetch données
  const fetchJoursFeries = async () => {
  try {
    const res = await axios.get("http://localhost:5050/jours-feries");
    // ⭐ ACCÉDER TOUJOURS À res.data.jours
    setJoursFeries(res.data.jours || []);
  } catch (err) {
    console.error("Erreur chargement jours fériés:", err);
    setJoursFeries([]);
  }
};
  const fetchConges = async () => {
    try {
      const res = await axios.get("http://localhost:5050/conges", { params: { limit: 10000 } });
      setConges(res.data.conges || []);
    } catch (err) {
      console.error("Erreur chargement congés:", err);
    }
  };const fetchData = async (searchParam) => {
  try {
    setLoading(true);
    setError("");
    
    const params = { 
      search: searchParam, 
      statut: statutFilter,
      page: currentPage,
      limit: itemsPerPage
    };
    
    // ⭐ AJOUT: Filtre département
    if (departementFilter) {
      params.departement = departementFilter;
    }

    const [empRes, presRes, depRes] = await Promise.all([
      axios.get("http://localhost:5050/employees", { params }),
      axios.get("http://localhost:5050/presences", { params: { limit: 10000 } }),
      axios.get("http://localhost:5050/departements")
    ]);
    
    setEmployes(empRes.data.employes || []);
    setAllPresences(presRes.data.presences || []);
    
    // ⭐ MODIFICATION: Stocker les départements ET sélectionner le premier par défaut
    const departementsList = depRes.data || [];
    setDepartements(departementsList);
    
    // ⭐ AJOUT: Sélectionner automatiquement le premier département s'il existe
    if (departementsList.length > 0 && !departementFilter) {
      setDepartementFilter(departementsList[0]._id);
    }
    
  } catch (err) {
    setError("Erreur lors du chargement des données");
    setEmployes([]);
    setAllPresences([]);
    setDepartements([]);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchData(debouncedSearch);
}, [debouncedSearch, statutFilter, departementFilter, currentPage]);
useEffect(() => {
  setCurrentPage(1);
}, [debouncedSearch, statutFilter, departementFilter]);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1200);
    return () => clearTimeout(handler);
  }, [search]);

  // Filtrer présences pour la date courante
  useEffect(() => {
    const currentDateStr = currentDate.toISOString().split("T")[0];
    const filtered = allPresences.filter(p => {
      if (!p.date) return false;
      return new Date(p.date).toISOString().split("T")[0] === currentDateStr;
    });
    setFilteredPresences(filtered);
  }, [currentDate, allPresences]);

  // Chargements initiaux
  useEffect(() => {
    fetchJoursFeries();
    fetchConges();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData(debouncedSearch);
  }, [debouncedSearch]);
// NOUVELLE FONCTION : Pointer matin/soir
const handlePointage = (employeId, typePointage) => {
  setSelectedEmploye(employeId);
  setTypePointageSelected(typePointage);
  
  if (typePointage === 'absent') {
    // Pour 'absent', pas besoin de saisir d'heure
    submitAbsent(employeId);
  } else {
    // Pour matin/soir, ouvrir la modal pour saisir l'heure
    setHeurePointage(typePointage === "matin" ? "08:00" : "14:00");
    setModalOpen(true);
  }
};

const submitAbsent = async (employeId) => {
  try {
    const payload = {
      employeId: employeId,
      date: currentDate.toISOString().split("T")[0],
      typePointage: 'absent',
      heureEntree: null, // Pas d'heure pour les absents
    };

    await axios.post("http://localhost:5050/presences/add-presence", payload);
    fetchData(debouncedSearch);
    showToast(`✅ Employé marqué absent pour toute la journée`);
    
  } catch (err) {
    showToast("❌ Erreur: " + (err.response?.data?.error || "Échec de la mise à jour"));
  }
};
const submitPointage = async () => {
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(heurePointage)) {
    setMessage("Format d'heure invalide. Utilisez HH:MM (ex: 08:30)");
    return;
  }

  try {
    const payload = {
      employeId: selectedEmploye,
      date: currentDate.toISOString().split("T")[0],
      typePointage: typePointageSelected,
      heureEntree: heurePointage,
    };
  
    await axios.post("http://localhost:5050/presences/add-presence", payload);
    fetchData(debouncedSearch);
  
    // Afficher le toast
    showToast(`✅ Pointage ${typePointageSelected} enregistré à ${heurePointage}`);
  } catch (err) {
    showToast("❌ Erreur: " + (err.response?.data?.error || "Échec du pointage"));
  }
   finally {
    setModalOpen(false);
    setSelectedEmploye(null);
    setTypePointageSelected("");
    setHeurePointage("");
  }
};


  const handleDelete = async (id) => {
  setPresenceToDelete(id);
  setDeleteModalOpen(true);
};

const confirmDelete = async () => {
  if (!presenceToDelete) return;
  
  try {
    await axios.delete(`http://localhost:5050/presences/${presenceToDelete}`);
    fetchData(debouncedSearch);
    showToast("✅ Présence supprimée avec succès");
  } catch (err) {
    showToast("❌ Erreur : " + (err.response?.data?.error || "Échec de la suppression"));
  } finally {
    setDeleteModalOpen(false);
    setPresenceToDelete(null);
  }
};

const cancelDelete = () => {
  setDeleteModalOpen(false);
  setPresenceToDelete(null);
};

  const handleEdit = (presence) => {
    navigate(`/admin/presences/edit/${presence._id}`);
  };

  const handleRefresh = () => {
  window.location.reload();
};
  // Helpers
  const isWeekend = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    return day === 0 || day === 6;
  };
  const showToast = (msg, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  };
  

  const isJourFerie = (date) => {
    const d = new Date(date);
    return joursFeries.some(jf => {
      if (!jf) return false;
      if (jf.date) {
        return new Date(jf.date).toISOString().split("T")[0] === d.toISOString().split("T")[0];
      }
      if (jf.dateDebut && jf.dateFin) {
        const deb = new Date(jf.dateDebut); deb.setHours(0,0,0,0);
        const fin = new Date(jf.dateFin); fin.setHours(23,59,59,999);
        return d >= deb && d <= fin;
      }
      return false;
    });
  };

  const isEmployeeOnConge = (empId, date) => {
    const d = new Date(date);
    return conges.some(cg => {
      if (!cg) return false;
      const emp = cg.employe ? (cg.employe._id || cg.employe) : null;
      if (!emp) return false;
      if (String(emp) !== String(empId)) return false;
      
      const statut = (cg.statut || "").toString().toLowerCase();
      if (!["accepté", "accepte"].includes(statut)) return false;
      
      if (cg.dateDebut && cg.dateFin) {
        const deb = new Date(cg.dateDebut); deb.setHours(0,0,0,0);
        const fin = new Date(cg.dateFin); fin.setHours(23,59,59,999);
        return d >= deb && d <= fin;
      }
      if (cg.date) {
        return new Date(cg.date).toISOString().split("T")[0] === d.toISOString().split("T")[0];
      }
      return false;
    });
  };

  // Grouper présences par employé
  const presencesMap = new Map();
  filteredPresences.forEach(p => {
    if (!p.employe?._id) return;
    if (!presencesMap.has(p.employe._id)) presencesMap.set(p.employe._id, []);
    presencesMap.get(p.employe._id).push(p);
  });

  const formatTime = (timeString) => (timeString ? timeString.substring(0, 5) : "-");
  const formatDisplayDate = (date) => new Date(date).toLocaleDateString("fr-FR", { 
    weekday: "long", day: "numeric", month: "long", year: "numeric" 
  });

  if (loading) return (
    <div className="liste-presence-container">
      <div className="loading">Chargement des données...</div>
    </div>
  );

  return (
  <div className="presence-container">
  <div className="presence-header">
    <h2>Gestion des Présences</h2>
    
    <div className="presence-search-and-actions">
      <div className="presence-search-box">
        <input 
          type="text" 
          placeholder="Rechercher par nom, prénom ou matricule..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <div className="presence-filter-group">
        <label>Département : </label>
<select 
  value={departementFilter} 
  onChange={(e) => setDepartementFilter(e.target.value)}
  className="presence-filter-select"
>
  {departements.map(dep => (
    <option key={dep._id} value={dep._id}>
      {dep.nom}
    </option>
  ))}
</select>
        <button onClick={handleRefresh} title="Actualiser les données">🔄</button>
      </div>
    </div> {/* Fin de presence-search-and-actions */}
    
    {/* Nouvelle ligne pour la navigation par jour */}
    <div className="presence-day-navigation">
      <div className="presence-day-controls">
        <button onClick={prevDay} className="presence-nav-btn">◀ Précédent</button>
        <button onClick={goToToday} className={`presence-today-btn ${isToday(currentDate) ? 'presence-active' : ''}`}>
          Aujourd'hui
        </button>
        <button onClick={nextDay} className="presence-nav-btn">Suivant ▶</button>
      </div>
      <div className="presence-current-date">{formatDisplayDate(currentDate)}</div>
    </div>
  </div>

  {error && <div className="presence-error">{error}<button onClick={() => setError("")}>×</button></div>}

  <div className="presence-stats">
    <span>{employes.length} employé(s) - {filteredPresences.length} présence(s) le {currentDate.toLocaleDateString('fr-FR')}</span>
  </div>

  <div className="presence-table-container">
    <table className="presence-table">
      <thead>
        <tr>
          <th>Matricule</th>
          <th>Nom & Prénom</th>
          <th>Poste</th>
          <th>Statut Présence</th>
          <th>Heures de pointage</th>
          <th>Retards</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {employes.length === 0 ? (
          <tr><td colSpan="7" className="presence-no-data">Aucun employé trouvé</td></tr>
        ) : (
          employes.map(emp => {
            const empPresences = presencesMap.get(emp._id) || [];
            const presenceDuJour = empPresences[0]; // Une seule présence par jour maintenant
            const globalNonOuvre = isWeekend(currentDate) || isJourFerie(currentDate);
            const empEnConge = isEmployeeOnConge(emp._id, currentDate);

            return (
              <tr key={emp._id} className="presence-row">
                <td className="presence-matricule">{emp.matricule}</td>
                <td className="presence-name"><strong>{emp.prenom} {emp.nom}</strong></td>
                <td className="presence-poste">{emp.poste || "-"}</td>
                
                {/* Colonne Statut Présence */}
                <td className="presence-status">
                  {presenceDuJour ? (
                    <div className="presence-status-item">
                      <span className={`presence-badge ${
                        presenceDuJour.statut === 'present-journee' ? 'presence-badge-present' : 
                        presenceDuJour.statut === 'absent' ? 'presence-badge-absent' : 'presence-badge-retard'
                      }`}>
                        {presenceDuJour.statut}
                      </span>
                    </div>
                  ) : (
                    <span className="presence-absent"></span>
                  )}
                </td>

                {/* Colonne Heures de pointage */}
                <td className="presence-heures">
                  {presenceDuJour ? (
                    <div className="presence-heures-list">
                      {presenceDuJour.presentMatin && (
                        <div className="presence-heure-item">
                          <span className="presence-heure-label">Matin:</span>
                          <span className="presence-heure-value">{formatTime(presenceDuJour.heureEntreeMatin)}</span>
                        </div>
                      )}
                      {presenceDuJour.presentSoir && (
                        <div className="presence-heure-item">
                          <span className="presence-heure-label">Soir:</span>
                          <span className="presence-heure-value">{formatTime(presenceDuJour.heureEntreeSoir)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="presence-no-heures">-</span>
                  )}
                </td>

                {/* Colonne Retards */}
                <td className="presence-retards">
                  {presenceDuJour ? (
                    <div className="presence-retards-list">
                      {presenceDuJour.retardMatin > 0 && (
                        <div className="presence-retard-item">
                          <span className="presence-po" title="Retard matin">
                            +{presenceDuJour.retardMatin}min
                          </span>
                        </div>
                      )}
                      {presenceDuJour.retardSoir > 0 && (
                        <div className="presence-retard-item">
                          <span className="presence-po" title="Retard soir">
                            +{presenceDuJour.retardSoir}min
                          </span>
                        </div>
                      )}
                      {(presenceDuJour.retardMatin === 0 && presenceDuJour.retardSoir === 0) && (
                        <span className="presence-ponctuel">Ponctuel</span>
                      )}
                    </div>
                  ) : (
                    <span className="presence-no-retard"></span>
                  )}
                </td>

                {/* Colonne Actions */}
                <td className="presence-actions">
                  {globalNonOuvre ? (
                    <span className="presence-disabled">Jour non ouvré</span>
                  ) : empEnConge ? (
                    <span className="presence-disabled">En congé</span>
                  ) : (
     <div className="presence-buttons">
  {/* Bouton matin */}
  <button 
    className={`presence-btn presence-btn-matin ${presenceDuJour?.presentMatin ? 'presence-disabled' : ''}`}
    onClick={() => handlePointage(emp._id, 'matin')}
    disabled={presenceDuJour?.presentMatin}
  >
    {presenceDuJour?.presentMatin ? '✓ Matin' : 'Matin'}
  </button>
  
  {/* Bouton soir */}
  <button 
    className={`presence-btn presence-btn-soir ${presenceDuJour?.presentSoir ? 'presence-disabled' : ''}`}
    onClick={() => handlePointage(emp._id, 'soir')}
    disabled={presenceDuJour?.presentSoir}
  >
    {presenceDuJour?.presentSoir ? '✓ Soir' : 'Soir'}
  </button>

  {/* Bouton absent */}
  <button 
    className={`presence-btn presence-btn-absent ${presenceDuJour?.statut === 'absent' ? 'presence-disabled' : ''}`}
    onClick={() => handlePointage(emp._id, 'absent')}
    disabled={presenceDuJour?.statut === 'absent'}
    title="Marquer absent toute la journée"
  >
    {presenceDuJour?.statut === 'absent' ? '✓Absent' : 'Absent'}
  </button>

  {/* Conteneur fixe pour modifier/supprimer - toujours présent */}
  <div className="presence-actions-group">
    {/* Bouton modifier - conditionnel mais espace réservé */}
    <button 
      className={`presence-edit-btn ${presenceDuJour ? 'visible' : ''}`}
      onClick={() => presenceDuJour && handleEdit(presenceDuJour)}
      title={presenceDuJour ? "Modifier" : ""}
      disabled={!presenceDuJour}
    >
      ✏️
    </button>
  
    {/* Bouton supprimer - conditionnel mais espace réservé */}
   {/* Bouton supprimer - conditionnel mais espace réservé */}
<button 
  className={`presence-delete-btn ${presenceDuJour ? 'visible' : ''}`}
  onClick={() => presenceDuJour && handleDelete(presenceDuJour._id)}
  title={presenceDuJour ? "Supprimer" : ""}
  disabled={!presenceDuJour}
>
  🗑️
</button>
  </div>


                    
                      {modalOpen && (
                        <div className="presence-modal-overlay">
                          <div className="presence-modal-content">
                            <h3>Pointage {typePointageSelected}</h3>
                            <label>
                              Heure d'arrivée:
                              <input 
                                type="time" 
                                value={heurePointage} 
                                onChange={(e) => setHeurePointage(e.target.value)} 
                              />
                            </label>
                            <div className="presence-modal-buttons">
                              <button onClick={submitPointage}>Valider</button>
                              <button onClick={() => setModalOpen(false)}>Annuler</button>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Modal de suppression */}
{deleteModalOpen && (
  <div className="presence-modal-overlay">
    <div className="presence-modal-content">
      <h3>Confirmer la suppression</h3>
      <p>Êtes-vous sûr de vouloir supprimer cette présence ?</p>
      <div className="presence-modal-buttons">
        <button onClick={confirmDelete} className="presence-delete-confirm">
          Oui, supprimer
        </button>
        <button onClick={cancelDelete} className="presence-delete-cancel">
          Annuler
        </button>
      </div>
    </div>
  </div>
)}
                    </div>
                  )}
                </td>
              </tr>
            );
          })
        )}
        
        {/* Pagination */}
{/* Pagination déplacée ici, juste après le tableau */}
{employes.length > 0 && (
  <div className="presence-pagination">
    <button 
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="presence-pagination-btn"
    >
      ◀ Précédent
    </button>
    
    <span className="presence-pagination-info">
      Page {currentPage} - {employes.length} employé(s)
    </span>
    
    <button 
      onClick={() => setCurrentPage(prev => prev + 1)}
      disabled={employes.length < itemsPerPage}
      className="presence-pagination-btn"
    >
      Suivant ▶
    </button>
  </div>
)}
    
      </tbody>
    </table>
    
    {message && (
      <div className="presence-toast">
        {message}
        <button onClick={() => setMessage("")}>×</button>
      </div>
    )}
  </div>
</div>
  );
};

export default ListePresence;