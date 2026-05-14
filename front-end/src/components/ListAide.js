import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../components/ListConge.css"; // réutilise le style commun

function ListAide() {
  const [aides, setAides] = useState([]);
  const [citoyens, setCitoyens] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [ressources, setRessources] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [selectedQuartier, setSelectedQuartier] = useState("");
  const [selectedRessource, setSelectedRessource] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Nombre de citoyens par page

  const citoyensActifs = citoyens.filter(c => c.statut === "actif");

  const navigate = useNavigate();

  // Debounce pour la recherche
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1200);
    return () => clearTimeout(handler);
  }, [search]);

  // Recharge les données quand les filtres changent
  useEffect(() => {
    fetchAllData();
  }, [debouncedSearch, selectedQuartier, selectedRessource]);

  // Réinitialise la page quand la liste des citoyens actifs change
  useEffect(() => {
    setCurrentPage(1);
  }, [citoyensActifs.length]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCitoyens(),
        fetchAides(),
        fetchQuartiers(),
        fetchRessources()
      ]);
    } catch (err) {
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCitoyens = async () => {
    try {
      const params = { 
        search: debouncedSearch, 
        statut: "actif",
        limit: 1000 
      };
      if (selectedQuartier) params.quartier = selectedQuartier;
      const res = await axios.get("http://localhost:5050/citoyens", { params });
      setCitoyens(res.data.citoyens || []);
    } catch (err) {
      console.error("Erreur citoyens:", err);
      setCitoyens([]);
    }
  };

  const fetchAides = async () => {
    try {
      const params = { 
        search: debouncedSearch, 
        limit: 1000 
      };
      if (selectedQuartier) params.quartier = selectedQuartier;
      if (selectedRessource) params.ressource = selectedRessource;
      const res = await axios.get("http://localhost:5050/aides", { params });
      // On garde toutes les aides (même celles sans bénéficiaire)
      setAides(res.data.aides || []);
    } catch (err) {
      console.error("Erreur aides:", err);
      setAides([]);
    }
  };

  const fetchQuartiers = async () => {
    try {
      const res = await axios.get("http://localhost:5050/quartiers");
      setQuartiers(res.data || []);
    } catch (err) {
      console.error("Erreur quartiers:", err);
      setQuartiers([]);
    }
  };

  const fetchRessources = async () => {
    try {
      const res = await axios.get("http://localhost:5050/ressources");
      setRessources(res.data.ressources || []);
    } catch (err) {
      console.error("Erreur ressources:", err);
      setRessources([]);
    }
  };

  // Navigation dans le calendrier
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    setMonth(prev => {
      if (prev === 0) {
        setYear(year - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const nextMonth = () => {
    setMonth(prev => {
      if (prev === 11) {
        setYear(year + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // Redirige vers le formulaire d'ajout avec date et citoyen pré-sélectionnés
  const handleAdd = (date, citoyen) => {
    navigate("/admin/aides/add", {
      state: {
        selectedDate: date.toISOString(),
        selectedCitoyen: citoyen
      }
    });
  };

  // Redirige vers le formulaire de modification
  const handleEdit = (aide) => {
    navigate(`/admin/aides/edit/${aide._id}`);
  };

  // Organise les aides par citoyen (uniquement celles qui ont un bénéficiaire)
  const aidesParCitoyen = new Map();
  aides.forEach(aide => {
    if (aide.beneficiaire && aide.beneficiaire._id) {
      const citoyenId = aide.beneficiaire._id;
      if (!aidesParCitoyen.has(citoyenId)) {
        aidesParCitoyen.set(citoyenId, []);
      }
      aidesParCitoyen.get(citoyenId).push(aide);
    }
  });

  // Aides collectives (beneficiaire === null) du mois en cours
  const aidesCollectivesDuMois = aides.filter(a => {
    if (a.beneficiaire) return false; // on ne garde que les aides sans bénéficiaire
    if (!a.dateDistribution) return false;
    const distDate = new Date(a.dateDistribution);
    return distDate.getMonth() === month && distDate.getFullYear() === year;
  });

  // Regrouper par date (JJ/MM/AAAA)
  const collectivesParDate = new Map();
  aidesCollectivesDuMois.forEach(a => {
    const dateKey = new Date(a.dateDistribution).toLocaleDateString('fr-FR');
    if (!collectivesParDate.has(dateKey)) {
      collectivesParDate.set(dateKey, []);
    }
    collectivesParDate.get(dateKey).push(a);
  });

  // Pagination des citoyens pour le tableau
  const paginateCitoyens = (liste) => {
    const start = (currentPage - 1) * itemsPerPage;
    return liste.slice(start, start + itemsPerPage);
  };

  const totalPagesCitoyens = citoyensActifs ? Math.ceil(citoyensActifs.length / itemsPerPage) : 0;

  if (loading) {
    return (
      <div className="listconge-container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="listconge-container">
      <div className="header">
        <div className="header-controls">
          <h2>Gestion des Aides</h2>
          <div className="controls">
            <div className="filters">
              <input
                type="text"
                placeholder="Rechercher un citoyen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={selectedQuartier}
                onChange={(e) => setSelectedQuartier(e.target.value)}
              >
                <option value="">Tous les quartiers</option>
                {quartiers.map(q => (
                  <option key={q._id} value={q._id}>{q.nom}</option>
                ))}
              </select>
              <select
                value={selectedRessource}
                onChange={(e) => setSelectedRessource(e.target.value)}
              >
                <option value="">Toutes les ressources</option>
                {ressources.map(r => (
                  <option key={r._id} value={r._id}>{r.nomres} ({r.typeres})</option>
                ))}
              </select>
              <button className="refresh-button" onClick={fetchAllData} title="Actualiser">🔄</button>
            </div>
            <div className="month-controls">
              <button onClick={prevMonth}>⬅ Précédent</button>
              <span className="month-display">
                {new Date(year, month).toLocaleString("fr-FR", { month: "long", year: "numeric" })}
              </span>
              <button onClick={nextMonth}>Suivant ➡</button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        {citoyensActifs.length === 0 ? (
          <div className="no-data">Aucun citoyen actif trouvé</div>
        ) : (
          <table className="calendar-table">
            <thead>
              <tr>
                <th>Citoyen</th>
                <th>Matricule</th>
                <th>Quartier</th>
                {days.map(d => (
                  <th key={d} className="day-header">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginateCitoyens(citoyensActifs).map(citoyen => {
                const citoyenAides = aidesParCitoyen.get(citoyen._id) || [];
                return (
                  <tr key={citoyen._id}>
                    <td className="employee-name">{citoyen.nom} {citoyen.prenom}</td>
                    <td className="employee-matricule">{citoyen.matricule}</td>
                    <td>{citoyen.id_quartier?.nom || "-"}</td>
                    {days.map(d => {
                      const currentDate = new Date(year, month, d);
                      currentDate.setHours(12, 0, 0, 0);

                      const aideDuJour = citoyenAides.find(a => {
                        if (!a.dateDistribution) return false;
                        const distDate = new Date(a.dateDistribution);
                        distDate.setHours(0,0,0,0);
                        return currentDate.toDateString() === distDate.toDateString();
                      });

                      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      const isPast = currentDate < today && !aideDuJour;

                      let cellClass = "day-cell";
                      if (aideDuJour) {
                        if (aideDuJour.statut === "distribuée") cellClass += " distribuee";
                        else if (aideDuJour.statut === "planifiée") cellClass += " planifiee";
                        else if (aideDuJour.statut === "annulée") cellClass += " annulee";
                      } else if (isWeekend) {
                        cellClass += " weekend";
                      } else if (isPast) {
                        cellClass += " past-day";
                      }

                      return (
                        <td
                          key={d}
                          className={cellClass}
                          onClick={() => aideDuJour && handleEdit(aideDuJour)}
                        >
                          <div className="day-content">
                            {aideDuJour && (
                              <span className="mini-label">
                                {aideDuJour.statut === "distribuée" ? "D" : 
                                 aideDuJour.statut === "planifiée" ? "P" : "A"}
                              </span>
                            )}
                            {!aideDuJour && !isWeekend && !isPast && (
                              <button 
                                className="add-conge-btn"
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  handleAdd(currentDate, citoyen); 
                                }}
                                title="Ajouter une aide"
                              >+</button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Section des aides collectives */}
        {aidesCollectivesDuMois.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3>🏘️ Aides collectives (tout le quartier) - {new Date(year, month).toLocaleString("fr-FR", { month: "long", year: "numeric" })}</h3>
            <table className="calendar-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Quartier</th>
                  <th>Ressource</th>
                  <th>Quantité</th>
                  <th>Statut</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(collectivesParDate.entries()).map(([dateKey, aidesDuJour]) =>
                  aidesDuJour.map(aide => (
                    <tr key={aide._id} onClick={() => handleEdit(aide)} style={{ cursor: 'pointer' }}>
                      <td>{dateKey}</td>
                      <td>{aide.quartier?.nom || '-'}</td>
                      <td>{aide.ressource?.nomres || '-'} ({aide.ressource?.unite || ''})</td>
                      <td>{aide.quantite}</td>
                      <td>
                        <span className={`badge ${aide.statut === 'distribuée' ? 'distribuee' : aide.statut === 'planifiée' ? 'planifiee' : 'annulee'}`}>
                          {aide.statut}
                        </span>
                      </td>
                      <td>{aide.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="footer">
        <div className="legend">
          <span className="badge distribuee">Distribuée</span>
          <span className="badge planifiee">Planifiée</span>
          <span className="badge annulee">Annulée</span>
          <span className="badge weekend">Weekend</span>
          <span className="badge past-day">Passé</span>
        </div>
        {citoyensActifs.length > itemsPerPage && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >◀ Précédent</button>
            <span className="pagination-info">Page {currentPage} sur {totalPagesCitoyens}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPagesCitoyens))}
              disabled={currentPage === totalPagesCitoyens}
            >Suivant ▶</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListAide;