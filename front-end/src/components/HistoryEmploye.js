import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const HistoryEmploye = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5050/employees/history/${id}`)
      .then((res) => setHistory(res.data))
      .catch((err) => {
        console.error(err);
        alert("Erreur de chargement de l'historique");
      });
  }, [id]);

  return (
    <div className="history-employe">
      <h2>Historique de l'employé</h2>

      {history.length === 0 ? (
        <p>Aucun historique disponible</p>
      ) : (
        <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "15px" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Action / Événement</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, index) => (
              <tr key={index}>
                <td>{new Date(h.date).toLocaleDateString()}</td>
                <td>{h.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={() => navigate(-1)}>Retour</button>
    </div>
  );
};

export default HistoryEmploye;
