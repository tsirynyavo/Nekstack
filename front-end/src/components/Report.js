import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserGraduate, FaBed, FaCheckCircle } from "react-icons/fa";
import '../components/Report.css'; // <-- importe ton CSS ici


const Report = () => {
  const [reportData, setReportData] = useState({
    totalStudents: 0,
    totalNotes: 0,
    totalPaiements: 0,
  });

  useEffect(() => {
    // Appel au backend pour récupérer le rapport
    axios
    .get("http://localhost:5050/report") // ajoute le port du backend
    .then((res) => setReportData(res.data))
    .catch((err) => console.error("Erreur récupération rapport :", err));
  
  }, []);

  return (
    <div className="report-container">
      <h1>Rapport de l'Ecole</h1>
      <div className="report-cards">
        <div className="report-card">
          <FaUserGraduate className="icon" />
          <h2>Étudiants</h2>
          <p>{reportData.totalStudents}</p>
        </div>
        <div className="report-card">
          <FaBed className="icon" />
          <h2>Eleves notés </h2>
          <p>{reportData.totalNotes}</p>
        </div>
        <div className="report-card">
          <FaCheckCircle className="icon" />
          <h2>Droit payé</h2>
          <p>{reportData.totalPaiements}</p>
        </div>
      </div>
    </div>
  );
};

export default Report;
