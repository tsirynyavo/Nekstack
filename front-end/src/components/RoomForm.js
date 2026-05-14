// src/components/AddPaiement.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import '../components/RoomForm.css'; // <-- importe ton CSS ici

const AddPaiement = () => {
  const { id } = useParams(); // pour modification
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [classeOptions, setClasseOptions] = useState([]);
  const [formData, setFormData] = useState({
    studentId: "",
    classe: "",
    categorie: "premiercycle",
    droitInscription: 18000,
    montantMois: 18000,
    moisEcolage: [],
  });

  const moisDisponibles = [
    "septembre","octobre","novembre","decembre",
    "janvier","fevrier","mars","avril","mai","juin"
  ];

  useEffect(() => {
    fetchStudents();
    fetchPaiements();
    updateClasseOptions("premiercycle");
    if (id) fetchPaiementById(id);
  }, [id]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5050/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Erreur chargement étudiants", err);
    }
  };

  const fetchPaiements = async () => {
    try {
      const res = await axios.get("http://localhost:5050/paiements");
      setPaiements(res.data);
    } catch (err) {
      console.error("Erreur chargement paiements", err);
    }
  };

  const fetchPaiementById = async (paiementId) => {
    try {
      const res = await axios.get(`http://localhost:5050/paiements/${paiementId}`);
      const p = res.data;
      setFormData({
        studentId: p.studentId._id,
        classe: p.classe,
        categorie: p.categorie,
        droitInscription: p.droitInscription,
        montantMois: p.moisEcolage[0]?.montant || (p.categorie === 'premiercycle' ? 18000 : 20000),
        moisEcolage: p.moisEcolage.map(m => ({
          mois: m.mois,
          datePaiement: new Date(m.datePaiement).toISOString().split("T")[0]
        }))
      });
      updateClasseOptions(p.categorie);
    } catch (err) {
      console.error("Erreur récupération paiement :", err);
    }
  };

  const updateClasseOptions = (categorie) => {
    setClasseOptions(
      categorie === "premiercycle"
        ? ["6eme", "5eme", "4eme", "3eme"]
        : ["2nde", "1ere", "Terminale"]
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "categorie") {
      updateClasseOptions(value);
      setFormData(prev => ({
        ...prev,
        categorie: value,
        montantMois: value === "premiercycle" ? 18000 : 20000,
        classe: "",
        studentId: "",
      }));
    } else if (name === "droitInscription" || name === "montantMois") {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMoisChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      let moisEcolage = [...prev.moisEcolage];
      if (checked) {
        moisEcolage.push({ mois: value, datePaiement: new Date().toISOString().split("T")[0] });
      } else {
        moisEcolage = moisEcolage.filter(m => m.mois !== value);
      }
      return { ...prev, moisEcolage };
    });
  };

  const handleDateChange = (mois, date) => {
    setFormData(prev => ({
      ...prev,
      moisEcolage: prev.moisEcolage.map(m => 
        m.mois === mois ? { ...m, datePaiement: date } : m
      )
    }));
  };

  const totalPaiement = formData.droitInscription + formData.moisEcolage.length * formData.montantMois;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const paiementData = {
      studentId: formData.studentId,
      classe: formData.classe,
      categorie: formData.categorie,
      droitInscription: formData.droitInscription,
      moisEcolage: formData.moisEcolage.map(m => ({
        mois: m.mois,
        montant: formData.montantMois,
        datePaiement: m.datePaiement
      })),
      montantMois: formData.montantMois
    };

    try {
      if (id) {
        await axios.put(`http://localhost:5050/paiements/${id}`, paiementData);
        alert("Paiement modifié avec succès !");
      } else {
        await axios.post("http://localhost:5050/paiements", paiementData);
        alert("Paiement ajouté avec succès !");
      }
      navigate("/admin/paiement");
    } catch (err) {
      console.error("Erreur ajout paiement", err);
      alert("Erreur lors de l'enregistrement du paiement.");
    }
  };

  // 🔹 Étudiants filtrés pour ajout (ceux qui n'ont pas encore de paiement)
  const studentsFiltered = id 
    ? [students.find(s => s._id === formData.studentId)].filter(Boolean)
    : students.filter(s => 
        s.classe === formData.classe &&
        !paiements.some(p => p.studentId?._id === s._id)
      );

  return (
    <div className="add-paiement" >
      <h2>{id ? "Modifier un paiement" : "Ajouter un paiement"}</h2>
      <form onSubmit={handleSubmit}>

        {/* Cycle */}
        <div>
          <label>Cycle :</label>
          {id ? (
            <input type="text" value={formData.categorie === "premiercycle" ? "Premier Cycle" : "Second Cycle"} readOnly />
          ) : (
            <select name="categorie" value={formData.categorie} onChange={handleChange}>
              <option value="premiercycle">Premier Cycle</option>
              <option value="secondcycle">Second Cycle</option>
            </select>
          )}
        </div>

        {/* Classe */}
        <div>
          <label>Classe :</label>
          {id ? (
            <input type="text" value={formData.classe} readOnly />
          ) : (
            <select name="classe" value={formData.classe} onChange={handleChange}>
              <option value="">--Choisir--</option>
              {classeOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>

        {/* Étudiant */}
        <div>
          <label>Étudiant :</label>
          {id ? (
            <input type="text" value={students.find(s => s._id === formData.studentId)?.name || ""} readOnly />
          ) : (
            <select name="studentId" value={formData.studentId} onChange={handleChange}>
              <option value="">--Choisir--</option>
              {studentsFiltered.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          )}
        </div>

        {/* Droit d'inscription */}
        <div>
          <label>Droit d'inscription :</label>
          <input type="number" name="droitInscription" value={formData.droitInscription} onChange={handleChange} />
        </div>

        {/* Montant d'un mois */}
        <div>
          <label>Montant d'un mois :</label>
          <input type="number" name="montantMois" value={formData.montantMois} onChange={handleChange} />
        </div>

        {/* Mois écolage */}
        <fieldset>
          <legend>Mois d'écolage</legend>
          {moisDisponibles.map(mois => {
            const paiementMois = formData.moisEcolage.find(me => me.mois === mois);
            return (
              <div key={mois}>
                <label>
                  <input
                    type="checkbox"
                    value={mois}
                    checked={!!paiementMois}
                    onChange={handleMoisChange}
                  />
                  {mois}
                </label>
                {paiementMois && (
                  <input
                    type="date"
                    value={paiementMois.datePaiement}
                    onChange={e => handleDateChange(mois, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </fieldset>

        {/* Total */}
        <div>
          <label>Total Paiement :</label>
          <input type="number" value={totalPaiement} readOnly />
        </div>

        <button type="submit">{id ? "Modifier" : "Ajouter"}</button>
        <button type="button" onClick={() => navigate("/admin/paiement")}>Annuler</button>
      </form>
    </div>
  );
};

export default AddPaiement;
