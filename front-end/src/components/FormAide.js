import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./FormConge.css";

const FormAide = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const preselectedCitoyen = location.state?.selectedCitoyen || null;
  const preselectedDate = location.state?.selectedDate || null;

  const [allRessources, setAllRessources] = useState([]);
  const [ressourcesFiltrees, setRessourcesFiltrees] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [citoyens, setCitoyens] = useState([]);
  const [citoyensDuQuartier, setCitoyensDuQuartier] = useState([]);

  const [ressourceId, setRessourceId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [dateDistribution, setDateDistribution] = useState("");
  const [beneficiaireId, setBeneficiaireId] = useState("");
  const [quartierId, setQuartierId] = useState("");
  const [statut, setStatut] = useState("planifiée");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resRessources, resQuartiers, resCitoyens] = await Promise.all([
          axios.get("http://localhost:5050/ressources"),
          axios.get("http://localhost:5050/quartiers"),
          axios.get("http://localhost:5050/citoyens", { params: { limit: 1000, statut: "actif" } })
        ]);
        setAllRessources(resRessources.data.ressources || []);
        setQuartiers(resQuartiers.data || []);
        setCitoyens(resCitoyens.data.citoyens || []);
      } catch (err) {
        console.error("Erreur chargement données:", err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Pré-remplissage si un citoyen est passé depuis le calendrier
  useEffect(() => {
    if (preselectedCitoyen) {
      setBeneficiaireId(preselectedCitoyen._id);
      const quartierDuCitoyen = preselectedCitoyen.id_quartier?._id || preselectedCitoyen.id_quartier;
      if (quartierDuCitoyen) {
        setQuartierId(quartierDuCitoyen);
      }
    }
  }, [preselectedCitoyen]);

  // Pré-remplissage de la date
  useEffect(() => {
    if (preselectedDate) {
      setDateDistribution(preselectedDate.slice(0, 10));
    }
  }, [preselectedDate]);

  // Chargement de l'aide en mode modification
  useEffect(() => {
    if (id) {
      setLoading(true);
      axios
        .get(`http://localhost:5050/aides/${id}`)
        .then((res) => {
          const aide = res.data;
          setRessourceId(aide.ressource?._id || "");
          setQuantite(aide.quantite || "");
          setDateDistribution(aide.dateDistribution ? new Date(aide.dateDistribution).toISOString().slice(0, 10) : "");
          setBeneficiaireId(aide.beneficiaire?._id || "");
          setQuartierId(aide.quartier?._id || "");
          setStatut(aide.statut || "planifiée");
          setDescription(aide.description || "");
        })
        .catch((err) => {
          console.error("Erreur chargement aide:", err);
          setError("Aide introuvable.");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Filtrer les citoyens du quartier sélectionné
  useEffect(() => {
    if (quartierId) {
      setCitoyensDuQuartier(
        citoyens.filter((c) => {
          const qId = c.id_quartier?._id || c.id_quartier;
          return qId === quartierId;
        })
      );
    } else {
      setCitoyensDuQuartier([]);
    }
  }, [quartierId, citoyens]);

  // Filtrer les ressources en fonction du quartier sélectionné
  useEffect(() => {
    if (quartierId) {
      const filtrees = allRessources.filter((r) => {
        const resQuartierId = r.id_quartier?._id || r.id_quartier;
        return resQuartierId === quartierId;
      });
      setRessourcesFiltrees(filtrees);

      if (filtrees.length === 1 && !ressourceId) {
        setRessourceId(filtrees[0]._id);
      } else if (filtrees.length === 0) {
        setRessourceId("");
      }
      if (ressourceId && !filtrees.find(r => r._id === ressourceId)) {
        setRessourceId("");
      }
    } else {
      setRessourcesFiltrees(allRessources);
    }
  }, [quartierId, allRessources, ressourceId]);

  // Récupérer l'objet ressource sélectionnée pour l'unité
  const ressourceSelectionnee = allRessources.find(r => r._id === ressourceId);

  // Nombre de citoyens actifs dans le quartier
  const nbHabitants = citoyensDuQuartier.length;

  // Quantité finale calculée (uniquement pour les nouvelles aides collectives)
  const quantiteFinaleCalculee = !beneficiaireId && !id && quantite
    ? Number(quantite) * nbHabitants
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!ressourceId || !quantite || !dateDistribution || !quartierId) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    // Calcul de la quantité à envoyer
    let quantiteAEnvoyer = Number(quantite);
    // Pour une nouvelle aide collective, on multiplie par le nombre d'habitants
    if (!beneficiaireId && !id) {
      quantiteAEnvoyer = Number(quantite) * nbHabitants;
    }

    const payload = {
      ressource: ressourceId,
      quantite: quantiteAEnvoyer,
      dateDistribution,
      beneficiaire: beneficiaireId || null,
      quartier: quartierId,
      statut,
      description
    };

    try {
      if (id) {
        await axios.put(`http://localhost:5050/aides/${id}`, payload);
        setModalMessage("Aide modifiée avec succès !");
      } else {
        await axios.post("http://localhost:5050/aides", payload);
        setModalMessage("Aide ajoutée avec succès !");
      }
      setShowModal(true);
    } catch (err) {
      console.error("Erreur soumission:", err);
      setError(err.response?.data?.error || "Erreur serveur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5050/aides/${id}`);
      setShowDeleteModal(false);
      setModalMessage("Aide supprimée avec succès !");
      setShowModal(true);
    } catch (err) {
      console.error("Erreur suppression:", err);
      setError("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{id ? "Modifier l'aide" : "Nouvelle attribution d'aide"}</h2>

      {loading && <div className="loading-spinner">Chargement...</div>}
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Quartier * :</label>
          <select value={quartierId} onChange={(e) => setQuartierId(e.target.value)} required>
            <option value="">-- Choisir un quartier --</option>
            {quartiers.map((q) => (
              <option key={q._id} value={q._id}>
                {q.nom} {citoyens.filter(c => (c.id_quartier?._id || c.id_quartier) === q._id).length > 0 && 
                  `(${citoyens.filter(c => (c.id_quartier?._id || c.id_quartier) === q._id).length} actifs)`}
              </option>
            ))}
          </select>
          {quartierId && <small style={{ color: 'gray' }}>{nbHabitants} citoyen(s) actif(s) dans ce quartier</small>}
        </div>

        <div className="form-group">
          <label>Ressource * :</label>
          <select
            value={ressourceId}
            onChange={(e) => setRessourceId(e.target.value)}
            required
            disabled={!quartierId || ressourcesFiltrees.length === 0}
          >
            <option value="">
              {!quartierId
                ? "Sélectionnez d'abord un quartier"
                : ressourcesFiltrees.length === 0
                  ? "Aucune ressource pour ce quartier"
                  : "-- Choisir une ressource --"}
            </option>
            {ressourcesFiltrees.map((r) => (
              <option key={r._id} value={r._id}>
                {r.nomres} ({r.typeres} - {r.unite}) - Stock : {r.quantiteactuelle}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            {!beneficiaireId && !id ? "Quantité par personne *" : "Quantité *"} :
          </label>
          <input
            type="number"
            min="1"
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            required
          />
          {!beneficiaireId && !id && quantite && nbHabitants > 0 && (
            <small style={{ color: 'green', display: 'block', marginTop: 4 }}>
              🔹 Quantité totale pour le quartier : {Number(quantite) * nbHabitants}{' '}
              {ressourceSelectionnee?.unite || ''} (pour {nbHabitants} citoyen(s) actif(s))
            </small>
          )}
          {!beneficiaireId && id && (
            <small style={{ color: 'gray', display: 'block', marginTop: 4 }}>
              (Aide collective : la quantité affichée correspond au total déjà attribué)
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Date de distribution * :</label>
          <input
            type="date"
            value={dateDistribution}
            onChange={(e) => setDateDistribution(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Bénéficiaire (optionnel) :</label>
          <select
            value={beneficiaireId}
            onChange={(e) => setBeneficiaireId(e.target.value)}
            disabled={!quartierId}
          >
            <option value="">-- Pour tout le quartier --</option>
            {citoyensDuQuartier.map((c) => (
              <option key={c._id} value={c._id}>
                {c.prenom} {c.nom} ({c.matricule})
              </option>
            ))}
          </select>
          {!quartierId && <small className="hint">Sélectionnez d'abord un quartier</small>}
        </div>

        <div className="form-group">
          <label>Statut :</label>
          <select value={statut} onChange={(e) => setStatut(e.target.value)} required>
            <option value="planifiée">Planifiée</option>
            <option value="distribuée">Distribuée</option>
            <option value="annulée">Annulée</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description :</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Détails supplémentaires..."
            rows="3"
          />
        </div>

        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? "Envoi..." : id ? "Modifier" : "Ajouter"}
          </button>
          <button type="button" onClick={() => navigate("/admin/aides")} disabled={loading}>
            Annuler
          </button>
          {id && (
            <button type="button" className="delete-btn" onClick={() => setShowDeleteModal(true)} disabled={loading}>
              Supprimer
            </button>
          )}
        </div>
      </form>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{modalMessage}</h3>
            <button
              onClick={() => {
                setShowModal(false);
                navigate("/admin/aides");
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Confirmation</h3>
            <p>Voulez-vous vraiment supprimer cette aide ? Cette action est irréversible.</p>
            <div className="modal-buttons">
              <button onClick={handleDelete} disabled={loading}>
                {loading ? "Suppression..." : "Oui, supprimer"}
              </button>
              <button onClick={() => setShowDeleteModal(false)} disabled={loading}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormAide;