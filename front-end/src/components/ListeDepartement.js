import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import '../components/ListDepartement.css';

const ListeDepartement = () => {
  const [departements, setDepartements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departementToDelete, setDepartementToDelete] = useState(null);

  useEffect(() => {
    fetchDepartements();
  }, []);

  // Récupérer la liste des départements
  const fetchDepartements = () => {
    axios
      .get("http://localhost:5050/departements")
      .then((res) => setDepartements(res.data))
      .catch((err) => console.error(err));
  };

  const deleteDepartement = (id) => {
    axios
      .delete(`http://localhost:5050/departements/${id}`)
      .then(() => {
        fetchDepartements();
        setDepartementToDelete(null); // Fermer le modal après suppression
      })
      .catch((err) => {
        console.error("Erreur lors de la suppression :", err);
        if (err.response && err.response.data && err.response.data.error) {
          alert(err.response.data.error);
        } else {
          alert("Erreur inconnue lors de la suppression");
        }
        setDepartementToDelete(null); // Fermer le modal en cas d'erreur
      });
  };

  // Filtrage selon la recherche
  const filteredDepartements = departements.filter((d) =>
    d.nom && d.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="studsents-list-header">
      <h2>Liste des départements</h2>

      <div className="seadrch-box">
        <input
          type="text"
          placeholder="Rechercher un département..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bouton d'ajout */}
      <Link to="/admin/departements/add">
        <button className="btssn btn-add">
          <span><FaUserPlus style={{ marginRight: "6px" }} /> Ajouter un département</span>
          <div className="isnner"></div>
        </button>
      </Link>

      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "15px" }}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepartements.map((d) => (
            <tr key={d._id}>
              <td>{d.nom}</td>
              <td>
                <Link to={`/admin/departements/edit/${d._id}`}>
                  <button className="ssbtn btn-modify">
                    <span><FaEdit style={{ marginRight: "5px" }} />Modifier</span>
                    <div className="innsser"></div>
                  </button>
                </Link>
                <button className="btsn btn-delete" onClick={() => setDepartementToDelete(d)}>
                  <span><FaTrash style={{ marginRight: "5px" }} /> Supprimer</span>
                  <div className="innesr"></div>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de suppression */}
      {departementToDelete && (
        <div className="presencex-modal-backdrop">
          <div className="presencex-modal">
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer le département <strong>"{departementToDelete.nom}"</strong> ?</p>
            <div className="presencex-form-buttons">
              <button 
                className="btn-delete-modal" 
                onClick={() => deleteDepartement(departementToDelete._id)}
              >
                Supprimer
              </button>
              <button 
                className="btn-cancel-modal"
                onClick={() => setDepartementToDelete(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeDepartement;