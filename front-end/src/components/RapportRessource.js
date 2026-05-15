import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../components/RapportConges.css"; // réutilise le style

const RapportRessource = () => {
  const navigate = useNavigate();
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtres, setFiltres] = useState({
    type: "",
    quartier: "",
    statut: ""
  });
  const [quartiers, setQuartiers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const typesRessource = [
    { value: "", label: "Tous" },
    { value: "eau", label: "Eau" },
    { value: "électricité", label: "Électricité" },
    { value: "riz", label: "Riz" },
    { value: "alimentaire", label: "Alimentaire" },
    { value: "kit scolaire", label: "Kit scolaire" },
    { value: "médicament", label: "Médicament" },
    { value: "coupon", label: "Coupon" },
    { value: "autre", label: "Autre" },
  ];

  useEffect(() => {
    fetchQuartiers();
  }, []);

  useEffect(() => {
    genererRapport();
  }, [filtres, currentPage]);

  const fetchQuartiers = async () => {
    try {
      const res = await axios.get("http://localhost:5050/quartiers");
      setQuartiers(res.data || []);
    } catch (err) {
      console.error("Erreur chargement quartiers:", err);
    }
  };

  const genererRapport = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        type: filtres.type || undefined,
        quartier: filtres.quartier || undefined,
        statut: filtres.statut || undefined,
        sortField: "nomres",
        sortOrder: "asc"
      };
      const res = await axios.get("http://localhost:5050/ressources", { params });
      setRessources(res.data.ressources || []);
    } catch (err) {
      console.error("Erreur génération rapport:", err);
      alert("Impossible de charger les ressources.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFiltres({ ...filtres, [field]: value });
    setCurrentPage(1); // réinitialise la pagination
  };

  const exporterCSV = async () => {
    try {
      // Utilise l'API d'export existante
      const res = await axios.get("http://localhost:5050/ressources/export", {
        params: {
          type: filtres.type || undefined,
          quartier: filtres.quartier || undefined,
          statut: filtres.statut || undefined
        }
      });
      const data = res.data;
      if (data.length === 0) {
        alert("Aucune ressource à exporter.");
        return;
      }
      const BOM = '\uFEFF';
      let csv = BOM + "Nom;Type;Unité;Capacité max;Qté actuelle;Quartier;Statut\n";
      data.forEach(r => {
        csv += `"${r.Nom}";${r.Type};${r.Unité};${r["Capacité max"]};${r["Quantité actuelle"]};${r.Quartier};${r.Statut}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-ressources.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur export CSV:", err);
      alert("Erreur lors de l'export");
    }
  };

  // Calculs statistiques
  const totalRessources = ressources.length;
  const ressourcesActives = ressources.filter(r => r.statut === "active").length;
  const ressourcesCritiques = ressources.filter(r => r.quantiteactuelle < r.capacitemax * 0.2).length;
  const sommeQuantites = ressources.reduce((sum, r) => sum + r.quantiteactuelle, 0);
  const sommeCapacites = ressources.reduce((sum, r) => sum + r.capacitemax, 0);
  const tauxRemplissage = sommeCapacites > 0 ? ((sommeQuantites / sommeCapacites) * 100).toFixed(1) : 0;

  return (
    <div className="rapsport-conges-container">
      <div className="rapsport-header">
        <div className="hseader-top">
          <button onClick={() => navigate(-1)} className="retour-btn">← Retour</button>
          <h1>Rapport des ressources</h1>
        </div>

        <div className="ssearch-period">
          <div className="dsate-inputs">
            <div className="inpdut-group">
              <label>Type :</label>
              <select value={filtres.type} onChange={e => handleFilterChange("type", e.target.value)}>
                {typesRessource.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="inpdut-group">
              <label>Quartier :</label>
              <select value={filtres.quartier} onChange={e => handleFilterChange("quartier", e.target.value)}>
                <option value="">Tous</option>
                {quartiers.map(q => <option key={q._id} value={q._id}>{q.nom}</option>)}
              </select>
            </div>
            <div className="inpdut-group">
              <label>Statut :</label>
              <select value={filtres.statut} onChange={e => handleFilterChange("statut", e.target.value)}>
                <option value="">Tous</option>
                <option value="active">Active</option>
                <option value="desactive">Désactivée</option>
              </select>
            </div>
          </div>
          <div className="actidon-buttons">
            <button onClick={genererRapport} disabled={loading} className="gednerate-btn">
              {loading ? "Chargement..." : "Actualiser"}
            </button>
            <button onClick={exporterCSV} className="expdort-btn">Exporter CSV</button>
            <button onClick={() => setFiltres({ type: "", quartier: "", statut: "" })} className="resedt-btn">Réinitialiser</button>
          </div>
        </div>
      </div>

      {/* Indicateurs */}
      <div className="stadts-indicator">
        <span>📦 {totalRessources} ressource(s) affichée(s) | ✅ {ressourcesActives} active(s) | ⚠️ {ressourcesCritiques} en alerte stock bas (&lt;20%)</span>
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="rapdport-content">
          <div className="tablde-container">
            <table className="condges-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Unité</th>
                  <th>Capacité max</th>
                  <th>Qté actuelle</th>
                  <th>%</th>
                  <th>Quartier</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {ressources.map(r => {
                  const pct = r.capacitemax > 0 ? ((r.quantiteactuelle / r.capacitemax) * 100).toFixed(0) : 0;
                  const isCritical = r.quantiteactuelle < r.capacitemax * 0.2;
                  return (
                    <tr key={r._id} className={isCritical ? "critical-row" : ""}>
                      <td><strong>{r.nomres}</strong></td>
                      <td>{r.typeres}</td>
                      <td>{r.unite}</td>
                      <td>{r.capacitemax}</td>
                      <td style={{ color: isCritical ? "red" : "inherit", fontWeight: isCritical ? "bold" : "normal" }}>
                        {r.quantiteactuelle}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <progress value={pct} max="100" style={{ width: "50px", marginRight: "5px" }} />
                          <span>{pct}%</span>
                        </div>
                      </td>
                      <td>{r.id_quartier?.nom || "-"}</td>
                      <td>
                        <span className={`sstatut-badge ${r.statut}`}>{r.statut}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="paginatsion">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>◀ Précédent</button>
            <span>Page {currentPage}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={ressources.length < itemsPerPage}>Suivant ▶</button>
          </div>

          {/* Statistiques globales */}
          <div className="rapsport-summary">
            <div className="susmmary-card">
              <h3>Qté totale stockée</h3>
              <p className="totsal-demandes">{sommeQuantites}</p>
            </div>
            <div className="summsary-card">
              <h3>Capacité totale</h3>
              <p className="demansdes-acceptees">{sommeCapacites}</p>
            </div>
            <div className="summarsy-card">
              <h3>Taux de remplissage global</h3>
              <p className="tausx-acceptation">{tauxRemplissage}%</p>
            </div>
          </div>
        </div>
      )}

      {!loading && ressources.length === 0 && (
        <div className="nos-data">Aucune ressource trouvée avec ces filtres.</div>
      )}
    </div>
  );
};

export default RapportRessource;