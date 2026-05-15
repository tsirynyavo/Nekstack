import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const FormQuartier = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:5050/quartiers/${id}`)
        .then((res) => setNom(res.data.nom || ""))
        .catch(() => alert("Erreur de chargement du quartier"));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nom.trim()) {
      setModalMessage("Le nom du quartier est obligatoire.");
      setShowModal(true);
      return;
    }

    const payload = { nom: nom.trim() };
    const url = id
      ? `http://localhost:5050/quartiers/${id}`
      : "http://localhost:5050/quartiers";
    const method = id ? axios.put : axios.post;

    method(url, payload)
      .then(() => {
        setModalMessage(id ? "Quartier modifié avec succès." : "Quartier ajouté avec succès.");
        setShowModal(true);
      })
      .catch((err) => {
        console.error(err.response?.data || err);
        setModalMessage(err.response?.data?.error || "Erreur lors de l'enregistrement.");
        setShowModal(true);
      });
  };

  // Style global du conteneur
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    backgroundColor: "#f3f4f6", // gris très clair
    padding: "1rem",
  };

  const formCardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "0.75rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "480px",
    padding: "2rem",
  };

  const titleStyle = {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "1.5rem",
    textAlign: "center",
  };

  const inputGroupStyle = {
    marginBottom: "1.5rem",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "0.25rem",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.625rem 0.75rem",
    fontSize: "0.875rem",
    color: "#111827",
    backgroundColor: "#f9fafb",
    border: "1px solid #d1d5db",
    borderRadius: "0.5rem",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
  };

  const inputFocusStyle = {
    borderColor: "#6366f1", // indigo discret
    boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
  };

  const buttonGroupStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "0.75rem",
    marginTop: "1.5rem",
  };

  const primaryButtonStyle = {
    padding: "0.625rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#ffffff",
    backgroundColor: "#4f46e5", // indigo professionnel
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "background 0.15s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };

  const cancelButtonStyle = {
    padding: "0.625rem 1.5rem",
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

  const modalTitleStyle = {
    fontSize: "1rem",
    fontWeight: 500,
    color: "#111827",
    marginBottom: "1rem",
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
    marginTop: "1rem",
  };

  // Gestion du focus input avec un state local
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={containerStyle}>
      <div style={formCardStyle}>
        <form onSubmit={handleSubmit}>
          <h2 style={titleStyle}>
            {id ? "Modifier le quartier" : "Ajouter un quartier"}
          </h2>

          <div style={inputGroupStyle}>
            <label style={labelStyle} htmlFor="nomQuartier">
              Nom du quartier
            </label>
            <input
              id="nomQuartier"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                ...inputStyle,
                ...(isFocused ? inputFocusStyle : {}),
              }}
              placeholder="Ex: Centre-ville"
              required
              autoFocus
            />
          </div>

          <div style={buttonGroupStyle}>
            <button type="submit" style={primaryButtonStyle}>
              {id ? "Modifier" : "Ajouter"}
            </button>
            <button
              type="button"
              style={cancelButtonStyle}
              onClick={() => navigate("/admin/quartiers")}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>

      {/* Modal de confirmation */}
      {showModal && (
        <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <p style={modalTitleStyle}>{modalMessage}</p>
            <button
              style={modalButtonStyle}
              onClick={() => {
                setShowModal(false);
                if (modalMessage.includes("succès")) {
                  navigate("/admin/quartiers");
                }
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormQuartier;