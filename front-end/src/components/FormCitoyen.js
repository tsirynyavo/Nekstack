import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/FormEmploye.css"; // même style

const FormCitoyen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quartiers, setQuartiers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    matricule: "",
    prenom: "",
    nom: "",
    cin: "",
    email: "",
    etat: "Célibataire",
    id_quartier: "",
    motdepasse: "",
    statut: "actif",
  });

  // Charger la liste des quartiers
  useEffect(() => {
    axios
      .get("http://localhost:5050/quartiers")
      .then((res) => setQuartiers(res.data))
      .catch((err) => console.error("Erreur chargement quartiers:", err));
  }, []);

  // Charger les données du citoyen en mode modification
  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:5050/citoyens/${id}`)
        .then((res) => {
          const data = res.data;
          setForm({
            matricule: data.matricule || "",
            prenom: data.prenom || "",
            nom: data.nom || "",
            cin: data.cin?.toString() || "",
            email: data.email || "",
            etat: data.etat || "Célibataire",
            id_quartier: data.id_quartier?._id || data.id_quartier || "",
            motdepasse: "", // on ne recharge jamais le mot de passe existant
            statut: data.statut || "actif",
          });
        })
        .catch(() => alert("Erreur de chargement du citoyen"));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation de base
    const { matricule, prenom, nom, cin, email, id_quartier } = form;
    if (!matricule || !prenom || !nom || !cin || !email || !id_quartier) {
      setModalMessage("Tous les champs obligatoires doivent être remplis.");
      setShowModal(true);
      return;
    }

    // En création, le mot de passe est obligatoire
    if (!id && !form.motdepasse) {
      setModalMessage("Le mot de passe est obligatoire.");
      setShowModal(true);
      return;
    }

    const payload = { ...form };
    // Si modification et motdepasse vide, on le supprime pour ne pas l'envoyer
    if (id && !payload.motdepasse) {
      delete payload.motdepasse;
    }

    const url = id
      ? `http://localhost:5050/citoyens/${id}`
      : "http://localhost:5050/citoyens";
    const method = id ? axios.put : axios.post;

    method(url, payload)
      .then(() => {
        setModalMessage(
          id ? "Citoyen modifié avec succès ✅" : "Citoyen ajouté avec succès ✅"
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
          <h2>{id ? "Modifier" : "Ajouter"} un citoyen</h2>

          <div className="form-main">
            {/* Colonne de gauche */}
            <div className="form-gauche">
              <div className="inputBox">
                <input
                  type="text"
                  value={form.matricule}
                  onChange={(e) => setForm({ ...form, matricule: e.target.value })}
                  required
                />
                <span>Matricule</span>
                <i></i>
              </div>

              <div className="inputBox">
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                />
                <span>Nom</span>
                <i></i>
              </div>

              <div className="inputBox">
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  required
                />
                <span>Prénom</span>
                <i></i>
              </div>

              <div className="inputBox">
                <input
                  type="number"
                  value={form.cin}
                  onChange={(e) => setForm({ ...form, cin: e.target.value })}
                  required
                />
                <span>CIN</span>
                <i></i>
              </div>

              <div className="inputBox">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <span>Email</span>
                <i></i>
              </div>

              <div className="inputBox">
                <select
                  value={form.etat}
                  onChange={(e) => setForm({ ...form, etat: e.target.value })}
                >
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié(e)">Marié(e)</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf/Veuve">Veuf/Veuve</option>
                </select>
                <span>État civil</span>
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

              <div className="inputBox password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.motdepasse}
                  onChange={(e) => setForm({ ...form, motdepasse: e.target.value })}
                  required={!id}
                  placeholder={id ? "Laissez vide pour ne pas changer" : "Mot de passe"}
                />
                <span>🔐 Mot de passe</span>
                <i></i>

                <button
                  type="button"
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              <div className="inputBox">
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="décédé">Décédé</option>
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
              onClick={() => navigate("/admin/citoyens")}
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
                      navigate("/admin/citoyens");
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

export default FormCitoyen;