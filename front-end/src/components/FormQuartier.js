import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/FormEmploye.css"; // même style

const FormQuartier = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Charger les données du quartier en mode modification
  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:5050/quartiers/${id}`)
        .then((res) => {
          setNom(res.data.nom || "");
        })
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
        setModalMessage(
          id ? "Quartier modifié avec succès ✅" : "Quartier ajouté avec succès ✅"
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
          <h2>{id ? "Modifier" : "Ajouter"} un quartier</h2>

          <div className="form-main" style={{ justifyContent: "center" }}>
            <div className="form-gauche" style={{ width: "100%", maxWidth: "400px" }}>
              <div className="inputBox">
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  autoFocus
                />
                <span>Nom du quartier</span>
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
              onClick={() => navigate("/admin/quartiers")}
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
                      navigate("/admin/quartiers");
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

export default FormQuartier;