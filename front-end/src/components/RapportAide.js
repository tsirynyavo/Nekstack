import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../components/RapportConges.css"; // réutilise le style

const RapportAide = () => {
  const navigate = useNavigate();
  const [rapport, setRapport] = useState(null);       // données regroupées
  const [loading, setLoading] = useState(false);
  const [citoyenAvecDetails, setCitoyenAvecDetails] = useState(null);
  const [dates, setDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [quartierFilter, setQuartierFilter] = useState("");
  const [ressourceFilter, setRessourceFilter] = useState("");
  const [quartiers, setQuartiers] = useState([]);
  const [ressources, setRessources] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleRetour = () => navigate(-1);

  useEffect(() => {
    fetchQuartiers();
    fetchRessources();
  }, []);

  useEffect(() => {
    genererRapport();
  }, [dates, quartierFilter, ressourceFilter, currentPage]);

  const fetchQuartiers = async () => {
    try {
      const res = await axios.get("http://localhost:5050/quartiers");
      setQuartiers(res.data || []);
    } catch (error) {
      console.error("Erreur chargement quartiers:", error);
    }
  };

  const fetchRessources = async () => {
    try {
      const res = await axios.get("http://localhost:5050/ressources");
      setRessources(res.data.ressources || []);
    } catch (error) {
      console.error("Erreur chargement ressources:", error);
    }
  };

  // Récupère toutes les aides de la période et les regroupe par citoyen
  const genererRapport = async () => {
    setLoading(true);
    try {
      const params = {
        dateDebut: dates.startDate,
        dateFin: dates.endDate,
        quartier: quartierFilter || undefined,
        ressource: ressourceFilter || undefined,
        limit: 10000, // tout récupérer pour agréger côté client
        page: 1
      };
      const res = await axios.get("http://localhost:5050/aides/rapport", { params });
      const toutesAides = res.data.aides || [];

      // Séparer aides individuelles et collectives
      const aidesIndividuelles = toutesAides.filter(a => a.beneficiaire);
      const aidesCollectives = toutesAides.filter(a => !a.beneficiaire);

      // Regrouper par citoyen
      const map = new Map();
      aidesIndividuelles.forEach(aide => {
        const citoyen = aide.beneficiaire;
        if (!citoyen) return;
        const id = citoyen._id;
        if (!map.has(id)) {
          map.set(id, {
            citoyen: citoyen,
            aides: [],
            nbPlanifiees: 0,
            nbDistribuees: 0,
            nbAnnulees: 0,
            quantiteTotale: 0
          });
        }
        const entry = map.get(id);
        entry.aides.push(aide);
        if (aide.statut === 'planifiée') entry.nbPlanifiees++;
        else if (aide.statut === 'distribuée') {
          entry.nbDistribuees++;
          entry.quantiteTotale += aide.quantite;
        } else if (aide.statut === 'annulée') entry.nbAnnulees++;
      });

      const rapportIndividuel = Array.from(map.values());

      // Pagination
      const totalItems = rapportIndividuel.length;
      const pages = Math.ceil(totalItems / itemsPerPage);
      const debut = (currentPage - 1) * itemsPerPage;
      const pageItems = rapportIndividuel.slice(debut, debut + itemsPerPage);

      setRapport({
        periode: `${dates.startDate} - ${dates.endDate}`,
        totalCitoyens: totalItems,
        page: currentPage,
        pages,
        aidesIndividuelles: pageItems,
        aidesCollectives,
        toutesAides
      });
      setCitoyenAvecDetails(null);
    } catch (error) {
      console.error("Erreur génération rapport:", error);
      alert("Erreur lors de la génération du rapport");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
  };

  const afficherDetails = (citoyenId) => {
    setCitoyenAvecDetails(citoyenAvecDetails === citoyenId ? null : citoyenId);
  };

  const exporterCSV = () => {
    if (!rapport) return;
    const BOM = '\uFEFF';
    let csv = BOM + "Type;Citoyen/Quartier;Matricule;Ressource;Quantité;Date;Statut;Description\n";

    rapport.toutesAides.forEach(aide => {
      const ligne = aide.beneficiaire
        ? `Individuelle;"${aide.beneficiaire.prenom} ${aide.beneficiaire.nom}";${aide.beneficiaire.matricule || ''};${aide.ressource?.nomres || ''};${aide.quantite};${new Date(aide.dateDistribution).toLocaleDateString('fr-FR')};${aide.statut};${aide.description || ''}`
        : `Collective;"${aide.quartier?.nom || ''}";-;${aide.ressource?.nomres || ''};${aide.quantite};${new Date(aide.dateDistribution).toLocaleDateString('fr-FR')};${aide.statut};${aide.description || ''}`;
      csv += ligne + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-aides-${dates.startDate}-${dates.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rapsport-conges-container">
      <div className="rapsport-header">
        <div className="hseader-top">
          <button onClick={handleRetour} className="retour-btn">← Retour</button>
          <h1>Rapport des aides</h1>
        </div>

        <div className="ssearch-period">
          <div className="dsate-inputs">
            <div className="isnput-group">
              <label>Du :</label>
              <input type="date" name="startDate" value={dates.startDate} onChange={handleDateChange} />
            </div>
            <div className="inpudt-group">
              <label>Au :</label>
              <input type="date" name="endDate" value={dates.endDate} onChange={handleDateChange} />
            </div>
            <div className="inpdut-group">
              <label>Quartier :</label>
              <select value={quartierFilter} onChange={e => setQuartierFilter(e.target.value)}>
                <option value="">Tous</option>
                {quartiers.map(q => <option key={q._id} value={q._id}>{q.nom}</option>)}
              </select>
            </div>
            <div className="inpdut-group">
              <label>Ressource :</label>
              <select value={ressourceFilter} onChange={e => setRessourceFilter(e.target.value)}>
                <option value="">Toutes</option>
                {ressources.map(r => <option key={r._id} value={r._id}>{r.nomres}</option>)}
              </select>
            </div>
          </div>
          <div className="actidon-buttons">
            <button onClick={genererRapport} disabled={loading} className="gednerate-btn">
              {loading ? "Génération..." : "Rechercher"}
            </button>
            <button onClick={exporterCSV} disabled={!rapport} className="expdort-btn">Exporter CSV</button>
            <button onClick={() => { setQuartierFilter(""); setRessourceFilter(""); }} className="resedt-btn">Réinitialiser</button>
          </div>
        </div>
      </div>

      {rapport && (
        <>
          <div className="stadts-indicator">
            <span>👥 {rapport.totalCitoyens} citoyen(s) bénéficiaires | 🏘️ {rapport.aidesCollectives.length} aides collectives</span>
          </div>

          <div className="rapdport-content">
            <div className="rappdort-period">
              <h2>{rapport.periode}</h2>
              <span className="okd-badge">OK</span>
            </div>

            <div className="paginadtion-info-top">
              📄 Page {rapport.page} sur {rapport.pages} – {rapport.aidesIndividuelles.length} citoyen(s) affiché(s)
            </div>

            <div className="tablde-container">
              <table className="condges-table">
                <thead>
                  <tr>
                    <th>Citoyen</th>
                    <th>Matricule</th>
                    <th>Planifiées</th>
                    <th>Distribuées</th>
                    <th>Annulées</th>
                    <th>Qté totale</th>
                    <th>Total aides</th>
                    <th>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {rapport.aidesIndividuelles.map(item => {
                    const total = item.nbPlanifiees + item.nbDistribuees + item.nbAnnulees;
                    return (
                      <React.Fragment key={item.citoyen._id}>
                        <tr className={`empqloye-row ${citoyenAvecDetails === item.citoyen._id ? 'expanded' : ''}`}>
                          <td><strong>{item.citoyen.prenom} {item.citoyen.nom}</strong></td>
                          <td>{item.citoyen.matricule}</td>
                          <td className="sstat-value en-attente">{item.nbPlanifiees}</td>
                          <td className="sstat-value accepte">{item.nbDistribuees}</td>
                          <td className="sstat-value refuse">{item.nbAnnulees}</td>
                          <td className="sstat-value total">{item.quantiteTotale}</td>
                          <td className="sstat-value total">{total}</td>
                          <td>
                            <button className={`destails-btn ${citoyenAvecDetails === item.citoyen._id ? 'active' : ''}`}
                              onClick={() => afficherDetails(item.citoyen._id)}>
                              {citoyenAvecDetails === item.citoyen._id ? 'Masquer' : 'Voir'}
                            </button>
                          </td>
                        </tr>
                        {citoyenAvecDetails === item.citoyen._id && (
                          <tr className="destails-row">
                            <td colSpan="8" className="detsails-container">
                              <div className="detsails-content">
                                <h4>Aides reçues – {item.citoyen.prenom} {item.citoyen.nom}</h4>
                                <table className="detsails-table">
                                  <thead>
                                    <tr>
                                      <th>Date</th>
                                      <th>Ressource</th>
                                      <th>Quantité</th>
                                      <th>Statut</th>
                                      <th>Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.aides.map((aide, idx) => (
                                      <tr key={idx}>
                                        <td>{new Date(aide.dateDistribution).toLocaleDateString('fr-FR')}</td>
                                        <td>{aide.ressource?.nomres || '-'}</td>
                                        <td>{aide.quantite}</td>
                                        <td><span className={`sstatut-badge ${aide.statut}`}>{aide.statut}</span></td>
                                        <td>{aide.description || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div className="destails-summary">
                                  <div className="ssummary-item">
                                    <span>Total distribué : </span><strong>{item.quantiteTotale} {item.aides[0]?.ressource?.unite || ''}</strong>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="paginatsion">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>◀ Précédent</button>
              <span>Page {rapport.page} / {rapport.pages}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= rapport.pages}>Suivant ▶</button>
            </div>

            {/* Section aides collectives */}
            {rapport.aidesCollectives.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3>Aides collectives (sans bénéficiaire individuel)</h3>
                <table className="condges-table">
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
                    {rapport.aidesCollectives.map((aide, idx) => (
                      <tr key={idx}>
                        <td>{new Date(aide.dateDistribution).toLocaleDateString('fr-FR')}</td>
                        <td>{aide.quartier?.nom || '-'}</td>
                        <td>{aide.ressource?.nomres || '-'}</td>
                        <td>{aide.quantite}</td>
                        <td><span className={`sstatut-badge ${aide.statut}`}>{aide.statut}</span></td>
                        <td>{aide.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Statistiques globales */}
            <div className="rapsport-summary">
              <div className="susmmary-card">
                <h3>Total aides</h3>
                <p className="totsal-demandes">{rapport.toutesAides.length}</p>
              </div>
              <div className="summsary-card">
                <h3>Distribuées</h3>
                <p className="demansdes-acceptees">
                  {rapport.toutesAides.filter(a => a.statut === 'distribuée').length}
                </p>
              </div>
              <div className="summarsy-card">
                <h3>Quantité totale distribuée</h3>
                <p className="tausx-acceptation">
                  {rapport.toutesAides
                    .filter(a => a.statut === 'distribuée')
                    .reduce((sum, a) => sum + a.quantite, 0)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {!rapport && !loading && (
        <div className="nos-data">
          <p>Sélectionnez une période et générez le rapport</p>
        </div>
      )}
    </div>
  );
};

export default RapportAide;