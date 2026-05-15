import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../components/ListEmploye.css"; // réutilise le même style pour l'instant
import { FaEdit, FaTrash, FaEye, FaUserPlus, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ListCitoyen = () => {
  const [citoyens, setCitoyens] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtres propres aux citoyens
  const [quartierFilter, setQuartierFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [etatFilter, setEtatFilter] = useState("");

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 5;

  // Pour le filtre quartier (liste déroulante)
  const [quartiers, setQuartiers] = useState([]);

  // Modal suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [citoyenToDelete, setCitoyenToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger les quartiers au montage
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

  // Charger les citoyens
  const fetchCitoyens = (pageNumber = 1) => {
    axios
      .get("http://localhost:5050/citoyens", {
        params: {
          page: pageNumber,
          limit,
          search: searchTerm,
          quartier: quartierFilter,
          statut: statutFilter,
          etat: etatFilter,
          sortField,
          sortOrder,
        },
      })
      .then((res) => {
        setCitoyens(res.data.citoyens);
        setPage(res.data.page);
        setPages(res.data.pages);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCitoyens(1);
  }, [searchTerm, quartierFilter, statutFilter, etatFilter, sortField, sortOrder]);

  // Pagination
  useEffect(() => {
    fetchCitoyens(page);
  }, [page]);

  // Suppression
  const openDeleteModal = (citoyen) => {
    setCitoyenToDelete(citoyen);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setCitoyenToDelete(null);
    setDeleteLoading(false);
  };

  const confirmDelete = async () => {
    if (!citoyenToDelete) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5050/citoyens/${citoyenToDelete._id}`);
      fetchCitoyens(page);
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
      const res = await axios.get("http://localhost:5050/citoyens/export", {
        params: { quartier: quartierFilter },
      });
      const allCitoyens = res.data;
      const worksheet = XLSX.utils.json_to_sheet(
        allCitoyens.map((c) => ({
          Matricule: c.matricule,
          "Nom & Prénom": `${c.nom} ${c.prenom}`,
          CIN: c.cin,
          Email: c.email,

          "État civil": c.etat,
          Téléphone: c.telephone || "-",   // ← AJOUT
          Quartier: c.quartier_nom || "-",
          Statut: c.statut,
          "Date d'enregistrement": c.datedesauvergarde
            ? new Date(c.datedesauvergarde).toLocaleDateString()
            : "-",
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Citoyens");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(data, "Liste_Citoyens.xlsx");
    } catch (err) {
      console.error("Impossible d'exporter :", err);
      alert("Erreur export");
    }
  };

  // Réinitialiser les filtres
  const resetAllFilters = () => {
    setSearchTerm("");
    setQuartierFilter("");
    setStatutFilter("");
    setEtatFilter("");
    setSortField("");
    setSortOrder("asc");
  };

  return (
    <div className="emp-container">
      <div className="emp-header">
        <h2>Liste des citoyens</h2>

        <div className="emp-search-box">
          <input
            type="text"
            placeholder="Rechercher par matricule, nom, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={exportToExcel} className="emp-btn-excel">
            <FaFileExcel style={{ marginRight: "5px" }} /> Exporter Excel
          </button>
        </div>

        <div className="emp-advanced-filters">
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
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="décédé">Décédé</option>
            </select>
          </div>

          {/* Filtre État civil */}
          <div className="emp-filter-group">
            <label>État civil : </label>
            <select value={etatFilter} onChange={(e) => setEtatFilter(e.target.value)}>
              <option value="">Tous</option>
              <option value="Célibataire">Célibataire</option>
              <option value="Marié(e)">Marié(e)</option>
              <option value="Divorcé(e)">Divorcé(e)</option>
              <option value="Veuf/Veuve">Veuf/Veuve</option>
            </select>
          </div>

          <button onClick={resetAllFilters} className="emp-btn-reset">
            Réinitialiser
          </button>
        </div>

        {/* Tri */}
        <div className="emp-sort-box">
          <Link to="/admin/citoyens/add">
            <button className="emp-btn-add">
              <FaUserPlus style={{ marginRight: "6px" }} /> Ajouter un citoyen
            </button>
          </Link>
          <label>Trier par : </label>
          <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
            <option value="">-- Aucun --</option>
            <option value="matricule">Matricule</option>
            <option value="nom">Nom</option>
            <option value="prenom">Prénom</option>
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
                <th>Matricule</th>
                <th>Nom & Prénom</th>
                <th>Email</th>
                
                <th>CIN</th>
                <th>État civil</th>
                <th>Quartier</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {citoyens.map((c) => (
                <tr key={c._id}>
                  <td className="emp-matricule">{c.matricule}</td>
                  <td className="emp-name">{c.nom} {c.prenom}</td>
                  <td>{c.email}</td>
                <td>{c.cin}</td>
                  <td>{c.etat}</td>
                  <td>{c.id_quartier?.nom || "-"}</td>
                  <td>
                    <span className={`emp-status-badge emp-status-${c.statut}`}>
                      {c.statut}
                    </span>
                  </td>
                  <td>
                    
    {/* Bouton Voir – bleu discret */}
    <Link to={`/admin/citoyens/view/${c._id}`}>
      <button
       
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "8px 16px",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "#1d4ed8",
          backgroundColor: "#ffffff",
          border: "1px solid #bfdbfe",
          borderRadius: "0.5rem",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          cursor: "pointer",
          transition: "background 0.15s ease",
        }}
      >
        <FaEye
          style={{
            marginRight: "6px",
            width: "16px",
            height: "16px",
            color: "#3b82f6",
          }}
        />
       
      </button>
    </Link>

    {/* Bouton Modifier – gris sobre */}
    <Link to={`/admin/citoyens/edit/${c._id}`}>
      <button
        
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "8px 16px",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "#374151",
          backgroundColor: "#ffffff",
          border: "1px solid #d1d5db",
          borderRadius: "0.5rem",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          cursor: "pointer",
          transition: "background 0.15s ease",
        }}
      >
        <FaEdit
          style={{
           
            width: "16px",
            height: "16px",
            color: "#6b7280",
          }}
        />
        
      </button>
    </Link>

    {/* Bouton Supprimer – rouge discret */}
    <button
      
      onClick={() => openDeleteModal(c)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 16px",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "#dc2626",
        backgroundColor: "#ffffff",
        border: "1px solid #fecaca",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transition: "background 0.15s ease",
      }}
    >
      <FaTrash
        style={{
          marginRight: "6px",
          width: "16px",
          height: "16px",
          color: "#ef4444",
        }}
      />
      
    </button>
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

        {/* Modal de suppression */}
        {deleteModalOpen && (
          <div className="emp-modal-overlay">
            <div className="emp-modal-content">
              <h3>Confirmer la suppression</h3>
              <p>
                Êtes-vous sûr de vouloir supprimer le citoyen{" "}
                <strong>{citoyenToDelete?.nom} {citoyenToDelete?.prenom}</strong>
                {citoyenToDelete?.matricule && ` (Matricule: ${citoyenToDelete.matricule})`} ?
              </p>
              
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

export default ListCitoyen;