import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../components/ListEmploye.css"; // même style
import { FaEdit, FaTrash, FaPlus, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ListQuartier = () => {
  const [quartiers, setQuartiers] = useState([]); // liste complète chargée
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quartierToDelete, setQuartierToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger tous les quartiers
  useEffect(() => {
    fetchQuartiers();
  }, []);

  const fetchQuartiers = async () => {
    try {
      const res = await axios.get("http://localhost:5050/quartiers");
      setQuartiers(res.data);
    } catch (err) {
      console.error("Erreur chargement quartiers:", err);
    }
  };

  // Filtrage et pagination
  const filteredQuartiers = quartiers.filter(q =>
    q.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuartiers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuartiers = filteredQuartiers.slice(startIndex, startIndex + itemsPerPage);

  // Réinitialiser la page lors d'une recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Suppression
  const openDeleteModal = (quartier) => {
    setQuartierToDelete(quartier);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setQuartierToDelete(null);
    setDeleteLoading(false);
  };

  const confirmDelete = async () => {
    if (!quartierToDelete) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5050/quartiers/${quartierToDelete._id}`);
      fetchQuartiers(); // recharger
      closeDeleteModal();
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Erreur lors de la suppression");
      setDeleteLoading(false);
    }
  };

  // Export Excel
  const exportToExcel = () => {
    const data = filteredQuartiers.map(q => ({
      Nom: q.nom,
      "Créé le": new Date(q.createdAt).toLocaleDateString('fr-FR')
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quartiers");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "Liste_Quartiers.xlsx");
  };

  return (
    <div className="emp-container">
      <div className="emp-header">
        <h2>Liste des quartiers</h2>

        <div className="emp-search-box">
          <input
            type="text"
            placeholder="Rechercher un quartier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={exportToExcel} className="emp-btn-excel">
            <FaFileExcel style={{ marginRight: "5px" }} /> Exporter Excel
          </button>
        </div>

        {/* Bouton Ajouter */}
        <div className="emp-sort-box">
          <Link to="/admin/quartiers/add">
            <button className="emp-btn-add">
              <FaPlus style={{ marginRight: "6px" }} /> Ajouter un quartier
            </button>
          </Link>
        </div>

        {/* Tableau */}
        <div className="emp-table-container">
          <table className="emp-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuartiers.map((q) => (
                <tr key={q._id}>
                  <td>{q.nom}</td>
                  <td>{new Date(q.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <div className="emp-actions">
                      <Link to={`/admin/quartiers/edit/${q._id}`}>
                        <button className="emp-btn-modify">
                          <FaEdit style={{ marginRight: "5px" }} /> Modifier
                        </button>
                      </Link>
                      <button
                        className="emp-btn-delete"
                        onClick={() => openDeleteModal(q)}
                      >
                        <FaTrash style={{ marginRight: "5px" }} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="emp-pagination">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Précédent
          </button>
          <span>
            Page {currentPage} sur {totalPages || 1}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Suivant
          </button>
        </div>

        {/* Modal de suppression */}
        {deleteModalOpen && (
          <div className="emp-modal-overlay">
            <div className="emp-modal-content">
              <h3>Confirmer la suppression</h3>
              <p>
                Êtes-vous sûr de vouloir supprimer le quartier{" "}
                <strong>{quartierToDelete?.nom}</strong> ?
              </p>
              <p className="emp-modal-warning">
                ⚠️ Cette action est irréversible ! (Les ressources et citoyens liés
                doivent être supprimés avant)
              </p>
              <div className="emp-modal-buttons">
                <button
                  onClick={confirmDelete}
                  className="emp-modal-confirm"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Suppression..." : "Oui, supprimer"}
                </button>
                <button
                  onClick={closeDeleteModal}
                  className="emp-modal-cancel"
                  disabled={deleteLoading}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListQuartier;