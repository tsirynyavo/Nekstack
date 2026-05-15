import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Chart } from "chart.js/auto";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import '../components/ManageStudents.css'; // <-- importe ton CSS ici


const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [chart, setChart] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  // Récupération de la liste des étudiants
  function fetchStudents() {
    axios
      .get("http://localhost:5050/students")
      .then((res) => {
        setStudents(res.data);
        drawChart(res.data);
      })
      .catch((err) => console.log(err));
  }

  // Création du graphique camembert (répartition par sexe)
  function drawChart(data) {
    const hommes = data.filter((s) => s.sexe.toLowerCase() === "homme").length;
    const femmes = data.filter((s) => s.sexe.toLowerCase() === "femme").length;
    const ctx = document.getElementById("sexeChart").getContext("2d");

    if (chart) chart.destroy();

    const newChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Homme", "Femme"],
        datasets: [
          {
            data: [hommes, femmes],
            backgroundColor: ["hsl(120, 40%, 30%)", "hsl(0, 60%, 40%)"],
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });

    setChart(newChart);
  }

  // Suppression d'un étudiant
  function deleteStudent(id) {
    const confirmation = window.confirm("Voulez-vous vraiment supprimer cet étudiant ?");
    if (!confirmation) return;

    axios
      .delete(`http://localhost:5050/students/${id}`)
      .then(fetchStudents)
      .catch((err) => console.error("Erreur lors de la suppression :", err));
  }

  // Filtrage des étudiants selon la recherche
  const filteredStudents = students.filter((s) =>
    (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.matricule && s.matricule.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.sexe && s.sexe.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.classe && s.classe.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.categorie && s.categorie.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (<div className="students-list-header">
  <h2>Liste des étudiants</h2>

  <div className="search-box">
    <input
      type="text"
      placeholder="Rechercher par nom, matricule, sexe, classe ou catégorie..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  {/* Bouton d'ajout */}
  <Link to="/admin/etudiants/add">
    <button className="btn btn-add">
      <span><FaUserPlus style={{ marginRight: "6px" }} /> Ajouter un étudiant</span>
      <div className="inner"></div>
    </button>
  </Link>

  <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "15px" }}>
    <thead>
      <tr>
        <th>Matricule</th>
        <th>Nom</th>
        <th>Prénom</th>
        <th>Sexe</th>
        <th>Classe</th>
        <th>Catégorie</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredStudents.map((s) => (
        <tr key={s._id}>
          <td>{s.matricule}</td>
          <td>{s.name}</td>
          <td>{s.lastname}</td>
          <td>{s.sexe}</td>
          <td>{s.classe}</td>
          <td>{s.categorie}</td>
          <td>
            <Link to={`/admin/etudiants/edit/${s._id}`}>
              <button className="btn btn-modify">
                <span><FaEdit style={{ marginRight: "5px" }} />Modifier</span>
                <div className="inner"></div>
              </button>
            </Link>
            <button className="btn btn-delete" onClick={() => deleteStudent(s._id)}>
              <span><FaTrash style={{ marginRight: "5px" }} /> Supprimer</span>
              <div className="inner"></div>
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <h3>Répartition par sexe</h3>
  <canvas id="sexeChart" width="120" height="120"></canvas>
</div>

  );
};

export default ManageStudents;
