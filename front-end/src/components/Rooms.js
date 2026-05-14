// src/components/PaiementsList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaPrint } from "react-icons/fa";
import { Link } from "react-router-dom";
import '../components/Rooms.css'; // <-- importe ton CSS ici



const PaiementsList = () => {
  const [paiements, setPaiements] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPaiements();
    fetchStudents();
  }, []);

  const fetchPaiements = async () => {
    try {
      const res = await axios.get("http://localhost:5050/paiements");
      setPaiements(res.data);
    } catch (err) {
      console.error("Erreur chargement paiements", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5050/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Erreur chargement étudiants", err);
    }
  };

  const handleDelete = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce paiement ?"
    );
    if (!confirmation) return;

    try {
      await axios.delete(`http://localhost:5050/paiements/${id}`);
      fetchPaiements();
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  const filteredPaiements = paiements.filter((p) => {
    const name = p.studentId?.name?.toLowerCase() || "";
    const classe = p.studentId?.classe?.toLowerCase() || "";
    const categorie = p.studentId?.categorie?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || classe.includes(term) || categorie.includes(term);
  });
  const printCarnet = (paiement) => {
  const student = paiement.studentId;
  const moisPaiements = paiement.moisEcolage;

  const carnetHTML = `
    <html>
    <head>
      <title>Carnet d'écolage - ${student?.name ?? "N/A"}</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #f0f0f0;
        }
        .header {
           text-align: left; /* Alignement à gauche */
          margin-bottom: 20px;
        }
        h2 { color: #003366; }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #333;
          padding: 8px;
          text-align: center;
        }
        th {
          background-color: #003366;
          color: #fff;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Carnet d'écolage</h2>
        <p><strong>Nom :</strong> ${student?.name ?? "N/A"}</p>
        <p><strong>Classe :</strong> ${student?.classe ?? "N/A"}</p>
        <p><strong>Catégorie :</strong> ${student?.categorie ?? "N/A"}</p>
        <p><strong>Droits d'inscription :</strong> ${paiement.droitInscription}</p>
        <p><strong>Total payé :</strong> ${paiement.totalPaiement}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Mois</th>
            <th>Montant payé</th>
            <th>Date de paiement</th>
          </tr>
        </thead>
        <tbody>
          ${moisPaiements.map(m => `
            <tr>
              <td>${m.mois}</td>
              <td>${m.montant}</td>
              <td>${m.datePaiement ? new Date(m.datePaiement).toLocaleDateString() : "N/A"}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=600,height=700');
  printWindow.document.write(carnetHTML);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};


  return (
    <div className="paiements-list">
  <h2>Liste des paiements</h2>

  <div className="search-box">
    <input
      type="text"
      placeholder="Rechercher par nom, classe ou catégorie..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  <Link to="/admin/paiement/add">
    <button className="btn btn-add">
      <span>
        <FaPlus style={{ marginRight: "6px" }} />Ajouter un paiement
      </span>
    </button>
  </Link>

  <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "15px" }}>
    <thead>
      <tr>
        <th>Nom</th>
        <th>Classe</th>
        <th>Catégorie</th>
        <th>Droits d'inscription</th>
        <th>Mois réglés</th>
        <th>Total payé</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredPaiements.map((p) => (
        <tr key={p._id}>
          <td>{p.studentId?.name || "N/A"}</td>
          <td>{p.studentId?.classe || "N/A"}</td>
          <td>{p.studentId?.categorie || "N/A"}</td>
          <td>{p.droitInscription}</td>
          <td>
            {p.moisEcolage.map((m) => `${m.mois}`).join(", ")}
          </td>
          <td>{p.totalPaiement}</td>
          <td>
            <Link to={`/admin/paiement/edit/${p._id}`}>
              <button className="btn btn-modify">
                <FaEdit style={{ marginRight: "5px" }} /> Payer l'ecolage
              </button>
            </Link>{" "}
            <button className="btn btn-delete" onClick={() => handleDelete(p._id)}>
              <FaTrash style={{ marginRight: "5px" }} /> Supprimer
            </button>
            <button
              className="btn btn-print"
              onClick={() => printCarnet(p)}
            >
              <FaPrint style={{ marginRight: "5px" }} /> Carnet
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
};

export default PaiementsList;
