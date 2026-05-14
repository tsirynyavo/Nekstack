import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import '../components/FormDepartement.css';

const FormDepartement = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: ""
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:5050/departements/${id}`)
        .then((res) => setForm(res.data))
        .catch(() => alert("Erreur de chargement"));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = id
      ? `http://localhost:5050/departements/${id}`
      : "http://localhost:5050/departements";
    const method = id ? axios.put : axios.post;

    method(url, form)
      .then(() => {
        setShowSuccessModal(true);
      })
      .catch((err) => {
        console.error(err.response?.data || err);
        alert(err.response?.data?.error || "Erreur lors de l'enregistrement");
      });
  };

  const closeModalAndRedirect = () => {
    setShowSuccessModal(false);
    navigate("/admin/departements");
  };

  return (
    <div className="studecnt-form">
      <form onSubmit={handleSubmit}>
        <h2>{id ? "Modifier" : "Ajouter"} un département</h2>

        {/* Nom du département */}
        <div className="incputBox">
          <span>Nom</span>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
          />
          <i></i>
        </div>

        <div className="butctons">
          <button type="submit" className="ccbtn-glow">
            {id ? "Modifier" : "Ajouter"}
          </button>
          <button
            type="button"
            className="btcccn-cancel"
            onClick={() => navigate("/admin/departements")}
          >
            Annuler
          </button>
        </div>
      </form>

      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="presencex-modal-backdrop-tt">
          <div className="presencex-modal-tt">
            <h3>✅ Succès</h3>
            <p>Département {id ? "modifié" : "ajouté"} avec succès !</p>
            <div className="presencex-form-buttons-tt">
              <button 
                className="btn-ok-modal-tt" 
                onClick={closeModalAndRedirect}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormDepartement;