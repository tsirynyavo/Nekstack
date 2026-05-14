import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/FormEmploye.css"; // même style

const FormRessource = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quartiers, setQuartiers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [form, setForm] = useState({
    nomres: "",
    typeres: "eau",
    unite: "",
    capacitemax: "",
    quantiteactuelle: "",
    id_quartier: "",
    statut: "active",
  });

  // Charger la liste des quartiers
  useEffect(() => {
    axios
      .get("http://localhost:5050/quartiers")
      .then((res) => setQuartiers(res.data))
      .catch((err) => console.error("Erreur chargement quartiers:", err));
  }, []);

  // Charger les données de la ressource en mode modification
  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:5050/ressources/${id}`)
        .then((res) => {
          const data = res.data;
          setForm({
            nomres: data.nomres || "",
            typeres: data.typeres || "eau",
            unite: data.unite || "",
            capacitemax: data.capacitemax?.toString() || "",
            quantiteactuelle: data.quantiteactuelle?.toString() || "",
            id_quartier: data.id_quartier?._id || data.id_quartier || "",
            statut: data.statut || "active",
          });
        })
        .catch(() => alert("Erreur de chargement de la ressource"));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation des champs obligatoires
    const { nomres, typeres, unite, capacitemax, quantiteactuelle, id_quartier } = form;
    if (!nomres || !typeres || !unite || capacitemax === "" || quantiteactuelle === "" || !id_quartier) {
      setModalMessage("Tous les champs obligatoires doivent être remplis.");
      setShowModal(true);
      return;
    }

    // Conversion en nombres
    const payload = {
      ...form,
      capacitemax: Number(form.capacitemax),
      quantiteactuelle: Number(form.quantiteactuelle),
    };

    const url = id
      ? `http://localhost:5050/ressources/${id}`
      : "http://localhost:5050/ressources";
    const method = id ? axios.put : axios.post;

    method(url, payload)
      .then(() => {
        setModalMessage(
          id ? "Ressource modifiée avec succès ✅" : "Ressource ajoutée avec succès ✅"
        );
        setShowModal(true);
      })
      .catch((err) => {
        console.error(err.response?.data || err);
        setModalMessage(
          err.response?.data?.error || "Erreur lors de l'enregistrement ❌"
        );
        setShowModal(true);
      });
  };

  return (
    <div className="employee-form-container">
      <div className="employee-form">
        <form onSubmit={handleSubmit}>
          <h2>{id ? "Modifier" : "Ajouter"} une ressource</h2>

          <div className="form-main">
            {/* Colonne de gauche */}
            <div className="form-gauche">
              <div className="inputBox">
                <input
                  type="text"
                  value={form.nomres}
                  onChange={(e) => setForm({ ...form, nomres: e.target.value })}
                  required
                />
                <span>Nom de la ressource</span>
                <i></i>
              </div>

              <div className="inputBox">
                <select
                  value={form.typeres}
                  onChange={(e) => setForm({ ...form, typeres: e.target.value })}
                >
                  <option value="eau">Eau</option>
                  <option value="électricité">Électricité</option>
                  <option value="riz">Riz</option>
                  <option value="alimentaire">Alimentaire</option>
                  <option value="kit scolaire">Kit scolaire</option>
                  <option value="médicament">Médicament</option>
                  <option value="coupon">Coupon</option>
                  <option value="autre">Autre</option>
                </select>
                <span>Type de ressource</span>
                <i></i>
              </div>

              <div className="inputBox">
                <input
                  type="text"
                  value={form.unite}
                  onChange={(e) => setForm({ ...form, unite: e.target.value })}
                  required
                  placeholder="ex: litres, kWh, sacs de 5kg..."
                />
                <span>Unité de mesure</span>
                <i></i>
              </div>

              <div className="inputBox">
                <input
                  type="number"
                  value={form.capacitemax}
                  onChange={(e) => setForm({ ...form, capacitemax: e.target.value })}
                  required
                  min="1"
                />
                <span>Capacité maximale</span>
                <i></i>
              </div>

              <div className="inputBox">
                <input
                  type="number"
                  value={form.quantiteactuelle}
                  onChange={(e) => setForm({ ...form, quantiteactuelle: e.target.value })}
                  required
                  min="0"
                  max={form.capacitemax || undefined}
                />
                <span>Quantité actuelle</span>
                <i></i>
              </div>
            </div>

            {/* Colonne de droite */}
            <div className="form-droite">
              <div className="inputBox">
                <select
                  value={form.id_quartier}
                  onChange={(e) => setForm({ ...form, id_quartier: e.target.value })}
                  required
                >
                  <option value="">Sélectionner un quartier</option>
                  {quartiers.map((q) => (
                    <option key={q._id} value={q._id}>
                      {q.nom}
                    </option>
                  ))}
                </select>
                <span>Quartier</span>
                <i></i>
              </div>

              <div className="inputBox">
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="desactive">Désactivée</option>
                </select>
                <span>Statut</span>
                <i></i>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="buttons">
            <button type="submit" className="btn-glow">
              {id ? "Modifier" : "Ajouter"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/admin/ressource")}
            >
              Annuler
            </button>
          </div>
        </form>

        {/* Modal de confirmation */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{modalMessage}</h3>
              <div className="modal-buttons">
                <button
                  onClick={() => {
                    setShowModal(false);
                    if (modalMessage.includes("succès")) {
                      navigate("/admin/ressource");
                    }
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormRessource;