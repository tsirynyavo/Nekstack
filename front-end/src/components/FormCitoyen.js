import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
    telephone: "",
    etat: "Célibataire",
    id_quartier: "",
    motdepasse: "",
    statut: "actif",
  });

  useEffect(() => {
    axios
      .get("http://localhost:5050/quartiers")
      .then((res) => setQuartiers(res.data))
      .catch((err) => console.error("Erreur chargement quartiers:", err));
  }, []);

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
            telephone: data.telephone || "",
            etat: data.etat || "Célibataire",
            id_quartier: data.id_quartier?._id || data.id_quartier || "",
            motdepasse: "",
            statut: data.statut || "actif",
          });
        })
        .catch(() => alert("Erreur de chargement du citoyen"));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const { matricule, prenom, nom, cin, email, id_quartier } = form;
    if (!matricule || !prenom || !nom || !cin || !email || !id_quartier) {
      setModalMessage("Tous les champs obligatoires doivent être remplis.");
      setShowModal(true);
      return;
    }

    if (!id && !form.motdepasse) {
      setModalMessage("Le mot de passe est obligatoire.");
      setShowModal(true);
      return;
    }

    const payload = { ...form };
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
          id ? "Citoyen modifié avec succès." : "Citoyen ajouté avec succès."
        );
        setShowModal(true);
      })
      .catch((err) => {
        console.error(err.response?.data || err);
        setModalMessage(
          err.response?.data?.error || "Erreur lors de l'enregistrement."
        );
        setShowModal(true);
      });
  };

  // ===== Styles =====
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    backgroundColor: "#f3f4f6",
    padding: "1rem",
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "0.75rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "900px",
    padding: "2rem",
  };

  const titleStyle = {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "1.5rem",
    textAlign: "center",
  };

  const formMainStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "2rem",
    justifyContent: "center",
  };

  const columnStyle = {
    flex: "1 1 280px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const inputBoxStyle = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    marginBottom: "0.25rem",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "0.2rem",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    color: "#111827",
    backgroundColor: "#f9fafb",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.75rem center",
    paddingRight: "2rem",
  };

  const hiddenIStyle = {
    display: "none",
  };

  const passwordContainerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
  };

  const passwordInputStyle = {
    ...inputStyle,
    paddingRight: "2.5rem",
  };

  const toggleButtonStyle = {
    position: "absolute",
    right: "0.25rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
    color: "#6b7280",
    padding: "0.25rem",
    lineHeight: 1,
  };

  const buttonGroupStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "0.75rem",
    marginTop: "2rem",
  };

  const primaryButtonStyle = {
    padding: "0.5rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#ffffff",
    backgroundColor: "#4f46e5",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "background 0.15s",
  };

  const cancelButtonStyle = {
    padding: "0.5rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "background 0.15s",
  };

  // Modal
  const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalCardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "0.75rem",
    padding: "1.5rem",
    maxWidth: "400px",
    width: "90%",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    textAlign: "center",
  };

  const modalMessageStyle = {
    fontSize: "1rem",
    fontWeight: 500,
    color: "#111827",
    margin: "0 0 1rem 0",
  };

  const modalButtonStyle = {
    padding: "0.5rem 2rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#ffffff",
    backgroundColor: "#4f46e5",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
  };

  return (
    <div className="employee-form-container" style={containerStyle}>
      <div className="employee-form" style={cardStyle}>
        <form onSubmit={handleSubmit}>
          <h2 style={titleStyle}>
            {id ? "Modifier un citoyen" : "Ajouter un citoyen"}
          </h2>

          <div className="form-main" style={formMainStyle}>
            {/* Colonne gauche */}
            <div className="form-gauche" style={columnStyle}>
              {/* Matricule */}
              <div className="inputBox" style={inputBoxStyle}>
                <span style={labelStyle}>Matricule</span>
                <input
                  type="text"
                  value={form.matricule}
                  onChange={(e) => setForm({ ...form, matricule: e.target.value })}
                  required
                  style={inputStyle}
                />
                <i style={hiddenIStyle}></i>
              </div>

              {/* Nom */}
              <div className="inputBox" style={inputBoxStyle}>
                <span style={labelStyle}>Nom</span>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                  style={inputStyle}
                />
                <i style={hiddenIStyle}></i>
              </div>

              {/* Prénom */}
              <div className="inputBox" style={inputBoxStyle}>
                <span style={labelStyle}>Prénom</span>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  required
                  style={inputStyle}
                />
                <i style={hiddenIStyle}></i>
              </div>

              {/* CIN */}
              <div className="inputBox" style={inputBoxStyle}>
                <span style={labelStyle}>CIN</span>
                <input
                  type="number"
                  value={form.cin}
                  onChange={(e) => setForm({ ...form, cin: e.target.value })}
                  required
                  style={inputStyle}
                />
                <i style={hiddenIStyle}></i>
              </div>

              {/* Email */}
              <div className="inputBox" style={inputBoxStyle}>
                <span style={labelStyle}>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={inputStyle}
                />
                <i style={hiddenIStyle}></i>
              </div>

              {/* Téléphone */}
              <div className="inputBox" style={inputBoxStyle}>
                <span style={labelStyle}>Téléphone</span>
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  style={inputStyle}
                />
                <i style={hiddenIStyle}></i>
              </div>

              {/* État civil */}
              <div className="inputBox" style={inputBoxStyle}>
                <span style={labelStyle}>État civil</span>
                <select
                  value={form.etat}
                  onChange={(e) => setForm({ ...form, etat: e.target.value })}
                  style={selectStyle}
                >
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié(e)">Marié(e)</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf/Veuve">Veuf/Veuve</option>
                </select>
                <i style={hiddenIStyle}></i>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="form-droite" style={columnStyle}>
              {/* Quartier */}
              <div className="inputBox" style={inputBoxStyle}>
                <span style={labelStyle}>Quartier</span>
                <select
                  value={form.id_quartier}
                  onChange={(e) => setForm({ ...form, id_quartier: e.target.value })}
                  required
                  style={selectStyle}
                >
                  <option value="">Sélectionner un quartier</option>
                  {quartiers.map((q) => (
                    <option key={q._id} value={q._id}>
                      {q.nom}
                    </option>
                  ))}
                </select>
                <i style={hiddenIStyle}></i>
              </div>

              {/* Mot de passe */}
              <div className="inputBox password-field" style={inputBoxStyle}>
                <span style={labelStyle}>Mot de passe</span>
                <div style={passwordContainerStyle}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.motdepasse}
                    onChange={(e) => setForm({ ...form, motdepasse: e.target.value })}
                    required={!id}
                    placeholder={id ? "Laissez vide pour ne pas changer" : ""}
                    style={passwordInputStyle}
                  />
                  <button
                    type="button"
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                    style={toggleButtonStyle}
                    title={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <i style={hiddenIStyle}></i>
              </div>

              {/* Statut */}
              <div className="inputBox" style={inputBoxStyle}>
                <span style={labelStyle}>Statut</span>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  style={selectStyle}
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="décédé">Décédé</option>
                </select>
                <i style={hiddenIStyle}></i>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="buttons" style={buttonGroupStyle}>
            <button type="submit" className="btn-glow" style={primaryButtonStyle}>
              {id ? "Modifier" : "Ajouter"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/admin/citoyens")}
              style={cancelButtonStyle}
            >
              Annuler
            </button>
          </div>
        </form>

        {/* Modal de confirmation */}
        {showModal && (
          <div className="modal-overlay" style={modalOverlayStyle}>
            <div className="modal" style={modalCardStyle}>
              <h3 style={modalMessageStyle}>{modalMessage}</h3>
              <div className="modal-buttons">
                <button
                  onClick={() => {
                    setShowModal(false);
                    if (modalMessage.includes("succès")) {
                      navigate("/admin/citoyens");
                    }
                  }}
                  style={modalButtonStyle}
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