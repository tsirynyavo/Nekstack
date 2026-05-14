import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../components/ListEmploye.css";
import { FaEdit, FaTrash, FaEye, FaPlus, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ListRessource = () => {
  const [ressources, setRessources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtres
  const [typeFilter, setTypeFilter] = useState("");
  const [quartierFilter, setQuartierFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 5;

  // Pour les listes déroulantes
  const [quartiers, setQuartiers] = useState([]);

  // Modal suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ressourceToDelete, setRessourceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchQuartiers();
  }, []);

  const fetchQuartiers = async () => {
    try {
      const res = await axios.get("http://localhost:5050/quartiers");
      setQuartiers(res.data);
    } catch (err) {
      console.error("Erreur chargement quartiers :", err);
    }
  };

  const fetchRessources = (pageNumber = 1) => {
    axios
      .get("http://localhost:5050/ressources", {
        params: {
          page: pageNumber,
          limit,
          search: searchTerm,
          type: typeFilter,
          quartier: quartierFilter,
          statut: statutFilter,
          sortField,
          sortOrder,
        },
      })
      .then((res) => {
        setRessources(res.data.ressources);
        setPage(res.data.page);
        setPages(res.data.pages);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchRessources(1);
  }, [searchTerm, typeFilter, quartierFilter, statutFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchRessources(page);
  }, [page]);

  // Suppression
  const openDeleteModal = (ressource) => {
    setRessourceToDelete(ressource);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setRessourceToDelete(null);
    setDeleteLoading(false);
  };

  const confirmDelete = async () => {
    if (!ressourceToDelete) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5050/ressources/${ressourceToDelete._id}`);
      fetchRessources(page);
      closeDeleteModal();
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Erreur lors de la suppression");
      setDeleteLoading(false);
    }
  };

  // Export Excel
  const exportToExcel = async () => {
    try {
      const res = await axios.get("http://localhost:5050/ressources/export", {
        params: {
          type: typeFilter,
          quartier: quartierFilter,
          statut: statutFilter,
        },
      });
      const allRessources = res.data;
      const worksheet = XLSX.utils.json_to_sheet(allRessources);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ressources");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(data, "Liste_Ressources.xlsx");
    } catch (err) {
      console.error("Erreur export :", err);
      alert("Erreur lors de l'export");
    }
  };

  // Réinitialisation
  const resetAllFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setQuartierFilter("");
    setStatutFilter("");
    setSortField("");
    setSortOrder("asc");
  };

  // Types de ressources pour le filtre
  const typesRessource = [
    { value: "", label: "Tous" },
    { value: "eau", label: "Eau" },
    { value: "électricité", label: "Électricité" },
    { value: "riz", label: "Riz" },
    { value: "alimentaire", label: "Alimentaire" },
    { value: "kit scolaire", label: "Kit scolaire" },
    { value: "médicament", label: "Médicament" },
    { value: "coupon", label: "Coupon" },
    { value: "autre", label: "Autre" },
  ];

  return (
    <div className="emp-container">
      <div className="emp-header">
        <h2>Liste des ressources</h2>

        <div className="emp-search-box">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={exportToExcel} className="emp-btn-excel">
            <FaFileExcel style={{ marginRight: "5px" }} /> Exporter Excel
          </button>
        </div>

        <div className="emp-advanced-filters">
          {/* Filtre Type */}
          <div className="emp-filter-group">
            <label>Type : </label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              {typesRessource.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Quartier */}
          <div className="emp-filter-group">
            <label>Quartier : </label>
            <select value={quartierFilter} onChange={(e) => setQuartierFilter(e.target.value)}>
              <option value="">Tous</option>
              {quartiers.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Statut */}
          <div className="emp-filter-group">
            <label>Statut : </label>
            <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}>
              <option value="">Tous</option>
              <option value="active">Active</option>
              <option value="desactive">Désactivée</option>
            </select>
          </div>

          <button onClick={resetAllFilters} className="emp-btn-reset">
            Réinitialiser
          </button>
        </div>

        {/* Tri + bouton Ajouter */}
        <div className="emp-sort-box">
          <Link to="/admin/ressource/add">
            <button className="emp-btn-add">
              <FaPlus style={{ marginRight: "6px" }} /> Ajouter une ressource
            </button>
          </Link>
          <label>Trier par : </label>
          <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
            <option value="">-- Aucun --</option>
            <option value="nomres">Nom</option>
            <option value="typeres">Type</option>
            <option value="capacitemax">Capacité max</option>
            <option value="quantiteactuelle">Qté actuelle</option>
          </select>
          <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            {sortOrder === "asc" ? "⬆️" : "⬇️"}
          </button>
        </div>

        {/* Tableau */}
        <div className="emp-table-container">
          <table className="emp-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Unité</th>
                <th>Capacité max</th>
                <th>Qté actuelle</th>
                <th>Quartier</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ressources.map((r) => (
                <tr key={r._id}>
                  <td className="emp-matricule">{r.nomres}</td>
                  <td>{r.typeres}</td>
                  <td>{r.unite}</td>
                  <td>{r.capacitemax}</td>
                  <td style={{ fontWeight: "bold", color: r.quantiteactuelle < r.capacitemax * 0.2 ? "red" : "inherit" }}>
                    {r.quantiteactuelle}
                  </td>
                  <td>{r.id_quartier?.nom || "-"}</td>
                  <td>
                    <span className={`emp-status-badge emp-status-${r.statut}`}>
                      {r.statut}
                    </span>
                  </td>
                  <td>
                    <div className="emp-actions">
                     
                      <Link to={`/admin/ressource/edit/${r._id}`}>
                        <button className="emp-btn-modify"><FaEdit style={{ marginRight: "5px" }} /> Modifier</button>
                      </Link>
                      <button className="emp-btn-delete" onClick={() => openDeleteModal(r)}>
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
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</button>
          <span>Page {page} sur {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Suivant</button>
        </div>

        {/* Modal suppression */}
        {deleteModalOpen && (
          <div className="emp-modal-overlay">
            <div className="emp-modal-content">
              <h3>Confirmer la suppression</h3>
              <p>
                Êtes-vous sûr de vouloir supprimer la ressource{" "}
                <strong>{ressourceToDelete?.nomres}</strong> ?
              </p>
              <p className="emp-modal-warning">⚠️ Cette action est irréversible !</p>
              <div className="emp-modal-buttons">
                <button onClick={confirmDelete} className="emp-modal-confirm" disabled={deleteLoading}>
                  {deleteLoading ? "Suppression..." : "Oui, supprimer"}
                </button>
                <button onClick={closeDeleteModal} className="emp-modal-cancel" disabled={deleteLoading}>
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

export default ListRessource;