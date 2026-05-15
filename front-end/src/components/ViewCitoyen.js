import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/ViewEmploye.css"; // réutilise le même style

const ViewCitoyen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [citoyen, setCitoyen] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5050/citoyens/${id}`)
      .then((res) => setCitoyen(res.data))
      .catch((err) => {
        console.error(err);
        alert("Erreur de chargement du citoyen");
      });
  }, [id]);

  if (!citoyen) return <p className="loading">Chargement...</p>;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <div className="view-employe">
      <div className="action-buttons">
        <button
          onClick={() => navigate(`/admin/citoyens/edit/${citoyen._id}`)}
          className="btn-edit"
        >
          Modifier
        </button>
        <button onClick={() => navigate(-1)} className="btn-back">
          Retour à la liste
        </button>
      </div>

      <h2>Informations du citoyen</h2>

      <div className="employee-header">
        <div className="basic-info">
          <h3>
            {citoyen.nom} {citoyen.prenom}
          </h3>
          <p>
            <strong>Matricule :</strong> {citoyen.matricule}
          </p>
          <p>
            <strong>Quartier :</strong> {citoyen.id_quartier?.nom || "-"}
          </p>
          <p>
            <strong>Statut :</strong>{" "}
            <span className={`status-badge status-${citoyen.statut}`}>
              {citoyen.statut}
            </span>
          </p>
        </div>
      </div>

      <div className="info-sections">
        {/* Section Informations Personnelles */}
        <div className="info-section">
          <h3>Informations Personnelles</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>CIN :</strong> {citoyen.cin}
            </div>
            <div className="info-item">
              <strong>Email :</strong> {citoyen.email}
            </div>
            <div className="info-item">
              <strong>État civil :</strong> {citoyen.etat}
            </div>
            <div className="info-item">
              <strong>Date d'enregistrement :</strong>{" "}
              {formatDate(citoyen.datedesauvergarde)}
            </div>
            <div className="info-item">
              <strong>Quartier :</strong> {citoyen.id_quartier?.nom || "-"}
            </div>
          </div>
        </div>

        {/* Section Statut */}
        <div className="info-section">
          <h3>Statut du compte</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Statut actuel :</strong>{" "}
              <span className={`status-badge status-${citoyen.statut}`}>
                {citoyen.statut}
              </span>
            </div>
            <div className="info-item">
              <strong>Dernière modification :</strong>{" "}
              {formatDate(citoyen.updatedAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCitoyen;