// src/components/NotesList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { FaUser,FaPrint, FaIdCard, FaEnvelope, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import'../components/ReservationList.css'; // <-- importe ton CSS ici

const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:5050/notes');
      setNotes(res.data);
    } catch (error) {
      console.error('Erreur chargement des notes', error);
    }
  };

  const handleDelete = async (id) => {
    const confirmation = window.confirm("Voulez-vous vraiment supprimer cette note ?");
    if (!confirmation) return;

    try {
      await axios.delete(`http://localhost:5050/notes/${id}`);
      fetchNotes();
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
  };

  // Filtrer selon le terme de recherche
  const filteredNotes = notes.filter(note => {
    const name = note.studentId?.name?.toLowerCase() || "";
    const classe = note.classe?.toLowerCase() || "";
    const categorie = note.categorie?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || classe.includes(term) || categorie.includes(term);
  });
  
  
  const printBulletin = (note) => {
  const semestres = [1,2,3,4,5,6];
  const matieres = ['malagasy','francais','anglais','mathematique','physique','svt','histogeo','Eva','Religion'];
  if(note.categorie === 'secondcycle') matieres.push('philosophie');

  // 🎨 couleur selon catégorie
  const backgroundColor = note.categorie === "premiercycle" ? "#fff9c4"  // jaune clair
                        : note.categorie === "secondcycle" ? "#c8e6c9"  // vert clair
                        : "#ffffff";

  const tableRows = semestres.map(sem => `
    <tr>
      <td>${sem}</td>
      ${matieres.map(m => `<td>${note[`S${sem}${m}`] ?? 0}</td>`).join('')}
      <td>${note[`S${sem}moyenne`]?.toFixed(2) ?? 0}</td>
    </tr>
  `).join('');

  const bulletinHTML = `
    <html>
      <head>
        <title>Bulletin de note - ${note.studentId?.name}</title>
        <style>
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            padding: 20px;
            margin: 0;
          }
          .bulletin {
            width: 90%;
            border-radius: 10px;
            overflow: hidden;
            padding: 20px;
            background-color: ${backgroundColor}; /* ✅ couleur appliquée ici */
            box-shadow: 3px 5px 12px rgba(0,0,0,0.2);
          }
          h2 { text-align: center; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 5px; text-align: center; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <div class="bulletin">
          <h2>Bulletin de note - ${note.studentId?.name}</h2>
          <p>Classe : ${note.classe} | Catégorie : ${note.categorie}</p>
          <table>
            <thead>
              <tr>
                <th>Semestre</th>
                ${matieres.map(m => `<th>${m}</th>`).join('')}
                <th>Moyenne</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <p>Total Moyenne : ${note.totalMoyenne?.toFixed(2) ?? 0}</p>
          <p>Statut : ${note.statut}</p>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(bulletinHTML);
  printWindow.document.close();
  printWindow.onload = () => { printWindow.focus(); printWindow.print(); };
};

  // Données pour histogramme (moyennes par semestre)
const data = {
  labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
  datasets: filteredNotes.map(note => ({
    label: note.studentId?.name || "Inconnu",
    backgroundColor: 'rgba(75,192,192,0.6)',
    borderColor: 'rgba(75,192,192,1)',
    borderWidth: 1,
    data: [
      note.S1moyenne || 0,
      note.S2moyenne || 0,
      note.S3moyenne || 0,
      note.S4moyenne || 0,
      note.S5moyenne || 0,
      note.S6moyenne || 0,
    ],
  }))
};


  const options = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 20
      },
    },
  };

  return (
    <div className="students-notes-list">
  <h2>Liste des notes des étudiants</h2>

  <div className="search-box">
    <input
      type="text"
      placeholder="Rechercher par nom, classe ou catégorie..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  <Link to="/admin/note/add">
    <button className="btn btn-add">
      <span><FaPlus style={{ marginRight: "6px" }} />Ajouter une note</span>
      <div className="inner"></div>
    </button>
  </Link>

  <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "15px" }}>
    <thead>
      <tr>
        <th>Nom</th>
        <th>Classe</th>
        <th>Catégorie</th>
        <th>DS1</th>
        <th>EXAMEN 1</th>
        <th>DS2</th>
        <th>EXAMEN 2</th>
        <th>DS3</th>
        <th>EXAMEN 3</th>
        <th>Moyenne Generale</th>
        <th>Statut</th>
        <th>Rang</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredNotes.map(note => (
        <tr key={note._id}>
          <td>{note.studentId?.name || "N/A"}</td>
          <td>{note.studentId?.categorie || "N/A"}</td>
          <td>{note.studentId?.classe || "N/A"}</td>
          <td>{note.S1moyenne?.toFixed(2)}</td>
          <td>{note.S2moyenne?.toFixed(2)}</td>
          <td>{note.S3moyenne?.toFixed(2)}</td>
          <td>{note.S4moyenne?.toFixed(2)}</td>
          <td>{note.S5moyenne?.toFixed(2)}</td>
          <td>{note.S6moyenne?.toFixed(2)}</td>
          <td>{note.totalMoyenne?.toFixed(2)}</td>
          <td>{note.statut}</td>
          <td>{note.rang}</td>
          <td>
            <Link to={`/admin/note/edit/${note._id}`}>
              <button className="btn btn-modify">
                <span><FaEdit style={{ marginRight: "5px" }} />Modifier</span>
                <div className="inner"></div>
              </button>
            </Link>{' '}
            <button className="btn btn-delete" onClick={() => handleDelete(note._id)}>
              <span><FaTrash style={{ marginRight: "5px" }} />Supprimer</span>
              <div className="inner"></div>
            </button>
            <button className="btn btn-add" onClick={() => printBulletin(note)}>
              <FaPrint style={{ marginRight: "5px" }} />Bulletin
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <h3>Histogramme des moyennes par semestre (1 étudiant sélectionné)</h3>
  <div style={{ width: 600, height: 300, margin: "0 auto" }}>
    <Bar data={data} options={options} />
  </div>
</div>


  );
};

export default NotesList;
