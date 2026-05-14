import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../components/RapportConges.css"; // style commun

const RapportQuartier = () => {
  const navigate = useNavigate();
  const [quartiers, setQuartiers] = useState([]);
  const [citoyens, setCitoyens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({}); // { quartierId: nombre }
  const [quartierA, setQuartierA] = useState("");
  const [quartierB, setQuartierB] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resQuartiers, resCitoyens] = await Promise.all([
        axios.get("http://localhost:5050/quartiers"),
        axios.get("http://localhost:5050/citoyens", {
          params: { statut: "actif", limit: 10000 }
        })
      ]);
      const quartiersData = resQuartiers.data;
      const citoyensData = resCitoyens.data.citoyens || [];

      // Comptage
      const compte = {};
      quartiersData.forEach(q => { compte[q._id] = 0; });
      citoyensData.forEach(c => {
        const qid = c.id_quartier?._id || c.id_quartier;
        if (qid) {
          compte[qid] = (compte[qid] || 0) + 1;
        }
      });

      setQuartiers(quartiersData);
      setCitoyens(citoyensData);
      setStats(compte);
    } catch (err) {
      console.error("Erreur chargement données:", err);
      alert("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  const getNomQuartier = (id) => {
    const q = quartiers.find(q => q._id === id);
    return q ? q.nom : "?";
  };

  const nbA = quartierA ? (stats[quartierA] || 0) : 0;
  const nbB = quartierB ? (stats[quartierB] || 0) : 0;

  const exporterCSV = () => {
    const BOM = '\uFEFF';
    let csv = BOM + "Quartier;Nombre de citoyens\n";
    quartiers.forEach(q => {
      csv += `"${q.nom}";${stats[q._id] || 0}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rapport_quartiers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="rapsport-conges-container">
      <div className="rapsport-header">
        <div className="hseader-top">
          <button onClick={() => navigate(-1)} className="retour-btn">← Retour</button>
          <h1>Rapport des quartiers</h1>
        </div>
        <div className="actidon-buttons" style={{ marginTop: 15 }}>
          <button onClick={fetchData} className="gednerate-btn">Actualiser</button>
          <button onClick={exporterCSV} className="expdort-btn">Exporter CSV</button>
        </div>
      </div>

      {/* Comparaison */}
      <div className="rapdport-content" style={{ marginTop: 20 }}>
        <div className="comparaison-container" style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, marginBottom: 30 }}>
          <h3>Comparaison entre deux quartiers</h3>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label>Quartier A : </label>
              <select value={quartierA} onChange={e => setQuartierA(e.target.value)}>
                <option value="">-- Choisir --</option>
                {quartiers.map(q => <option key={q._id} value={q._id}>{q.nom}</option>)}
              </select>
            </div>
            <div>
              <label>Quartier B : </label>
              <select value={quartierB} onChange={e => setQuartierB(e.target.value)}>
                <option value="">-- Choisir --</option>
                {quartiers.map(q => <option key={q._id} value={q._id}>{q.nom}</option>)}
              </select>
            </div>
          </div>
          {(quartierA || quartierB) && (
            <div style={{ marginTop: 15, display: 'flex', gap: 30, justifyContent: 'center', fontSize: '1.2em' }}>
              {quartierA && (
                <div>
                  <strong>{getNomQuartier(quartierA)}</strong> : {nbA} citoyen(s)
                </div>
              )}
              {quartierA && quartierB && <div>VS</div>}
              {quartierB && (
                <div>
                  <strong>{getNomQuartier(quartierB)}</strong> : {nbB} citoyen(s)
                </div>
              )}
              {quartierA && quartierB && (
                <div style={{ color: nbA > nbB ? 'green' : nbA < nbB ? 'red' : 'inherit', fontWeight: 'bold' }}>
                  {nbA > nbB ? `↗ ${getNomQuartier(quartierA)} a plus d'habitants` : 
                   nbA < nbB ? `↗ ${getNomQuartier(quartierB)} a plus d'habitants` : 
                   "Égalité parfaite"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tableau global */}
        <h3>Population par quartier</h3>
        <div className="tablde-container">
          <table className="condges-table">
            <thead>
              <tr>
                <th>Quartier</th>
                <th>Nombre de citoyens</th>
              </tr>
            </thead>
            <tbody>
              {quartiers.map(q => (
                <tr key={q._id}>
                  <td>{q.nom}</td>
                  <td style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{stats[q._id] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Statistiques simples */}
        <div className="rapsport-summary">
          <div className="susmmary-card">
            <h3>Total quartiers</h3>
            <p className="totsal-demandes">{quartiers.length}</p>
          </div>
          <div className="summsary-card">
            <h3>Total citoyens (actifs)</h3>
            <p className="demansdes-acceptees">{citoyens.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RapportQuartier;