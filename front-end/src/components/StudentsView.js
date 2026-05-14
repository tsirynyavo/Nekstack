// components/StudentsView.jsx
import React, { useEffect, useState } from "react";

export default function StudentsView() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/students")
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors du chargement");
        return res.json();
      })
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{color: "red"}}>{error}</p>;

  return (
    <div>
      <h2>Liste des étudiants</h2>
      <ul>
        {students.map((student) => (
          <li key={student._id}>
            <strong>{student.name}</strong> — {student.email} — CIN: {student.cin} — Sexe: {student.sexe}
          </li>
        ))}
      </ul>
    </div>
  );
}
