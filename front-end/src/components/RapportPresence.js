import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../components/RapportPresence.css";

const RapportPresence = () => {
  const navigate = useNavigate();
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false); // ⭐ AJOUT: État pour l'export
  const [employeAvecDetails, setEmployeAvecDetails] = useState(null);
  const [dates, setDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // ⭐ NOUVEAUX ÉTATS
  const [departementFilter, setDepartementFilter] = useState("");
  const [departements, setDepartements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 5 employés par page
  const [donneesCompletes, setDonneesCompletes] = useState(null); // ⭐ AJOUT: Données complètes pour l'export

  // Fonction pour retourner à la page précédente
  const handleRetour = () => {
    navigate(-1);
  };

  // ⭐ AJOUT: Charger les départements
  const fetchDepartements = async () => {
    try {
      const res = await axios.get("http://localhost:5050/departements");
      setDepartements(res.data || []);
    } catch (error) {
      console.error("Erreur chargement départements:", error);
    }
  };

  // Charger les données par défaut au montage du composant
  useEffect(() => {
    genererRapport();
    fetchDepartements(); // ⭐ AJOUT
  }, []);

  // ⭐ MODIFIÉ: Ajouter les dépendances
  useEffect(() => {
    genererRapport();
  }, [currentPage, departementFilter]);

  // ⭐ AJOUT: Réinitialiser la pagination quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [dates.startDate, dates.endDate, departementFilter]);

  const genererRapport = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5050/presences/rapport-heures", {
        params: {
          startDate: dates.startDate,
          endDate: dates.endDate,
          departement: departementFilter || undefined, // ⭐ AJOUT: Filtre département
          page: currentPage, // ⭐ AJOUT: Pagination
          limit: itemsPerPage // ⭐ AJOUT: 5 employés par page
        }
      });
      setRapport(response.data);
      setEmployeAvecDetails(null);
      
      // ⭐ AJOUT: Stocker les données complètes pour l'export (seulement à la première page)
      if (currentPage === 1) {
        const donneesCompletesResponse = await axios.get("http://localhost:5050/presences/rapport-heures", {
          params: {
            startDate: dates.startDate,
            endDate: dates.endDate,
            departement: departementFilter || undefined,
            page: 1,
            limit: 10000 // ⭐ Récupérer tous les employés
          }
        });
        setDonneesCompletes(donneesCompletesResponse.data.rapport || []);
      }
      
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la génération du rapport");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDates({
      ...dates,
      [e.target.name]: e.target.value
    });
  };

  const afficherDetails = (employeData) => {
    setEmployeAvecDetails(employeAvecDetails === employeData.employe._id ? null : employeData.employe._id);
  };

  // ⭐ CORRECTION: Fonction pour exporter en CSV TOUTES les données
  const exporterCSV = async () => {
    if (!donneesCompletes || donneesCompletes.length === 0) {
      // Si pas de données complètes en cache, les récupérer
      setExporting(true);
      try {
        const donneesCompletesResponse = await axios.get("http://localhost:5050/presences/rapport-heures", {
          params: {
            startDate: dates.startDate,
            endDate: dates.endDate,
            departement: departementFilter || undefined,
            page: 1,
            limit: 10000
          }
        });
        
        const tousLesEmployes = donneesCompletesResponse.data.rapport || [];
        genererCSV(tousLesEmployes);
        
      } catch (error) {
        console.error("Erreur export CSV:", error);
        alert("❌ Erreur lors de l'export CSV");
      } finally {
        setExporting(false);
      }
    } else {
      // Utiliser les données complètes stockées
      genererCSV(donneesCompletes);
    }
  };

  // ⭐ FONCTION POUR GÉNÉRER LE CSV
  const genererCSV = (employesData) => {
    const BOM = '\uFEFF';
    let csvContent = BOM + "Employé;Matricule;Département;Poste;Heures travaillées;Jours travaillés;Moyenne/jour\n";
    
    employesData.forEach(employeData => {
      const moyenneParJour = employeData.joursTravailles > 0 
        ? (employeData.totalHeures / employeData.joursTravailles).toFixed(2) 
        : "0";
      
      csvContent += `"${employeData.employe.prenom} ${employeData.employe.nom}";${employeData.employe.matricule || ''};${employeData.employe.departement_id?.nom || '-'};${employeData.employe.poste || '-'};${employeData.totalHeures.toFixed(2)};${employeData.joursTravailles};${moyenneParJour}\n`;
    });
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `rapport-presences-complet-${dates.startDate}-${dates.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
   
  };

  return (
    <div className="rappscsort-container">
      {/* En-tête avec recherche */}
      <div className="rappocrt-header">
        <div className="headcer-top">
          <button 
            onClick={handleRetour}
            className="retourc-btn"
          >
            ← Retour
          </button>
          <h1>Rapport des Présences</h1>
        </div>
        
        <div className="searccch-period">
          <div className="dacte-inputs">
            <div className="icnput-group">
              <label>Du :</label>
              <input
                type="date"
                name="startDate"
                value={dates.startDate}
                onChange={handleDateChange}
              />
            </div>
            
            <div className="inpcut-group">
              <label>Au :</label>
              <input
                type="date"
                name="endDate"
                value={dates.endDate}
                onChange={handleDateChange}
              />
            </div>

            {/* ⭐ AJOUT: Filtre Département */}
            <div className="inpcut-group">
              <label>Département :</label>
              <select
                value={departementFilter}
                onChange={(e) => setDepartementFilter(e.target.value)}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              >
                <option value="">Tous les départements</option>
                {departements.map(dep => (
                  <option key={dep._id} value={dep._id}>
                    {dep.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="asction-buttons">
            <button 
              onClick={genererRapport} 
              disabled={loading}
              className="genserate-btn"
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "⏳ Chargement..." : "Rechercher"}
            </button>

            {/* ⭐ CORRECTION: Bouton Export CSV avec état exporting */}
            <button 
              onClick={exporterCSV}
              disabled={!rapport || exporting}
              className="expscort-btn"
              style={{
                padding: "8px 16px",
                backgroundColor: exporting ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: (!rapport || exporting) ? "not-allowed" : "pointer"
              }}
            >
              {exporting ? "⏳ Export..." : "📊 Exporter CSV Complet"}
            </button>

            {/* ⭐ AJOUT: Bouton réinitialiser */}
            <button 
              onClick={() => {
                setDepartementFilter("");
                setCurrentPage(1);
              }}
              className="resecst-btn"
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              🔄 Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des résultats */}
      {rapport && (
        <div className="rappocrt-content">
          <div className="rappsort-period">
            <h2>Période : {rapport.periode}</h2>
            <span className="tostal-employes">
              {rapport.rapport.length} employé(s) affiché(s) sur {rapport.totalEmployes || rapport.rapport.length} au total
            </span>
          </div>

          {/* ⭐ AJOUT: Indicateur de pagination */}
          <div className="paginatsion-info-top" style={{
            marginBottom: "15px",
            fontSize: "14px",
            color: "#666",
            textAlign: "center",
            padding: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px"
          }}>
            📄 Page {currentPage} sur {rapport.pages || 1}
          </div>

          <div className="tablce-container">
            <table className="racpport-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Département</th>
                  <th>Heures travaillées</th>
                  <th>Jours travaillés</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {rapport.rapport.map((employeData, index) => (
                  <React.Fragment key={employeData.employe._id}>
                    <tr className={`empsloye-row ${employeAvecDetails === employeData.employe._id ? 'expanded' : ''}`}>
                      <td className="emsploye-name">
                        <strong>{employeData.employe.prenom} {employeData.employe.nom}</strong>
                        <br />
                        <small>{employeData.employe.poste} - {employeData.employe.matricule}</small>
                      </td>
                     <td className="desspartement">
  {employeData.employe.departement_id?.nom || 
   (employeData.employe.departement_id && typeof employeData.employe.departement_id === 'object' ? 
    employeData.employe.departement_id.nom : 
    employeData.employe.departement_id) || 
   "-"}
</td>
                      <td className="heudres-travaillees">
                        <strong>{employeData.totalHeures.toFixed(2)}h</strong>
                      </td>
                      <td className="joursd-travailles">
                        {employeData.joursTravailles} jour(s)
                      </td>
                      <td className="detqdails-cell">
                        <button 
                          className={`dedqtails-btn ${employeAvecDetails === employeData.employe._id ? 'active' : ''}`}
                          onClick={() => afficherDetails(employeData)}
                        >
                          {employeAvecDetails === employeData.employe._id ? 'Masquer détails' : 'Voir détails'}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Ligne de détails qui s'affiche en dessous de l'employé */}
                    {employeAvecDetails === employeData.employe._id && (
                      <tr className="detailds-row">
                        <td colSpan="5" className="detaqils-container">
                          <div className="detaidls-content">
                            <div className="detdsails-header">
                              <h4>Détails des présences - {employeData.employe.prenom} {employeData.employe.nom}</h4>
                              <span className="totsal-details">
                                {employeData.totalHeures.toFixed(2)} heures totales sur {employeData.details.length} jours
                              </span>
                            </div>
                            
                            {/* Tableau des détails */}
                            <table className="dsdetails-table">
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Heures</th>
                                  <th>Présences</th>
                                  <th>Heures d'entrée</th>
                                </tr>
                              </thead>
                              <tbody>
                                {employeData.details.map((detail, index) => (
                                  <tr key={index} className="detsail-row">
                                    <td className="dsetail-date">
                                      {new Date(detail.date).toLocaleDateString('fr-FR', { 
                                        weekday: 'short', 
                                        day: 'numeric', 
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </td>
                                    <td className="deqtail-heures">
                                      <strong>{detail.heuresJour}h</strong>
                                    </td>
                                    <td className="destail-presences">
                                      <div className="pressence-badges">
                                        {detail.presentMatin && (
                                          <span className="pressence-badge matin">Matin</span>
                                        )}
                                        {detail.presentSoir && (
                                          <span className="presesnce-badge soir">Soir</span>
                                        )}
                                        {!detail.presentMatin && !detail.presentSoir && (
                                          <span className="presesnce-badge absent">Absent</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="detasil-heures-entree">
                                      <div className="hesures-entree">
                                        {detail.heureEntreeMatin && (
                                          <span>Matin: {detail.heureEntreeMatin.substring(0, 5)}</span>
                                        )}
                                        {detail.heureEntreeSoir && (
                                          <span>Soir: {detail.heureEntreeSoir.substring(0, 5)}</span>
                                        )}
                                        {!detail.heureEntreeMatin && !detail.heureEntreeSoir && (
                                          <span>-</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            
                            {/* Statistiques résumées */}
                            <div className="detadils-stats">
                              <div className="stadst-item">
                                <span className="sqd-label">Jours complets:</span>
                                <span className="sdtat-value">
                                  {employeData.details.filter(d => d.presentMatin && d.presentSoir).length} jours
                                </span>
                              </div>
                              <div className="stadt-item">
                                <span className="sdtat-label">Demi-journées:</span>
                                <span className="stdat-value">
                                  {employeData.details.filter(d => (d.presentMatin && !d.presentSoir) || (!d.presentMatin && d.presentSoir)).length} jours
                                </span>
                              </div>
                              <div className="stadt-item">
                                <span className="sdtat-label">Absences:</span>
                                <span className="stdat-value">
                                  {employeData.details.filter(d => !d.presentMatin && !d.presentSoir).length} jours
                                </span>
                              </div>
                              <div className="stadt-item">
                                <span className="sdtat-label">Moyenne/jour:</span>
                                <span className="stdat-value">
                                  {(employeData.totalHeures / employeData.details.length).toFixed(2)}h
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* ⭐ AJOUT: Pagination */}
          {rapport && (
            <div className="pagsqdination" style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "15px",
              marginTop: "20px",
              padding: "15px",
              borderTop: "1px solid #eee"
            }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagissnation-btn"
                style={{
                  padding: "8px 16px",
                  backgroundColor: currentPage === 1 ? "#6c757d" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer"
                }}
              >
                ◀ Précédent
              </button>
              
              <span className="paginatsion-info" style={{
                fontSize: "14px",
                color: "#666",
                fontWeight: "bold"
              }}>
                Page {currentPage} {rapport.pages ? `sur ${rapport.pages}` : ''}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={rapport.pages ? currentPage >= rapport.pages : rapport.rapport.length < itemsPerPage}
                className="pagisnation-btn"
                style={{
                  padding: "8px 16px",
                  backgroundColor: (rapport.pages ? currentPage >= rapport.pages : rapport.rapport.length < itemsPerPage) ? "#6c757d" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: (rapport.pages ? currentPage >= rapport.pages : rapport.rapport.length < itemsPerPage) ? "not-allowed" : "pointer"
                }}
              >
                Suivant ▶
              </button>
            </div>
          )}

          {/* Résumé global */}
          <div className="rapporst-summary">
            <div className="summasry-card">
              <h3>Total heures travaillées</h3>
              <p className="total-hours">
                {rapport.rapport.reduce((sum, emp) => sum + emp.totalHeures, 0).toFixed(2)}h
              </p>
            </div>
            <div className="summarcy-card">
              <h3>Moyenne par employé</h3>
              <p className="averages-hours">
                {(rapport.rapport.reduce((sum, emp) => sum + emp.totalHeures, 0) / rapport.rapport.length).toFixed(2)}h
              </p>
            </div>
            <div className="summaryc-card">
              <h3>Jours travaillés total</h3>
              <p className="totacl-jours">
                {rapport.rapport.reduce((sum, emp) => sum + emp.joursTravailles, 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {!rapport && !loading && (
        <div className="noc-data">
          <p>Sélectionnez une période et générez le rapport</p>
        </div>
      )}
    </div>
  );
};

export default RapportPresence;