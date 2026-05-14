// src/components/AddNote.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import'../components/ReservationForm.css'; // <-- importe ton CSS ici

const AddNote = () => {
  const { id } = useParams(); // récupère l'id si c'est une modification
  const [students, setStudents] = useState([]);
  const [classeOptions, setClasseOptions] = useState([]);
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: '',
    classe: '',
    categorie: 'premiercycle',
    S1malagasy:'',S1francais:'',S1anglais:'',S1mathematique:'',S1physique:'',S1svt:'',S1histogeo:'',S1philosophie:'',S1Eva:'',S1Religion:'',
    S2malagasy:'',S2francais:'',S2anglais:'',S2mathematique:'',S2physique:'',S2svt:'',S2histogeo:'',S2philosophie:'',S2Eva:'',S2Religion:'',
    S3malagasy:'',S3francais:'',S3anglais:'',S3mathematique:'',S3physique:'',S3svt:'',S3histogeo:'',S3philosophie:'',S3Eva:'',S3Religion:'',
    S4malagasy:'',S4francais:'',S4anglais:'',S4mathematique:'',S4physique:'',S4svt:'',S4histogeo:'',S4philosophie:'',S4Eva:'',S4Religion:'',
    S5malagasy:'',S5francais:'',S5anglais:'',S5mathematique:'',S5physique:'',S5svt:'',S5histogeo:'',S5philosophie:'',S5Eva:'',S5Religion:'',
    S6malagasy:'',S6francais:'',S6anglais:'',S6mathematique:'',S6physique:'',S6svt:'',S6histogeo:'',S6philosophie:'',S6Eva:'',S6Religion:'',
  });

  const [diviseur, setDiviseur] = useState(6);


  useEffect(() => {
    fetchStudents();
    fetchNotes();
    updateClasseOptions('premiercycle');

    if (id) fetchNoteById(id); // si modification, on charge la note
  }, [id]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5050/students');
      setStudents(res.data);
    } catch (err) {
      console.error("Erreur chargement étudiants", err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:5050/notes');
      setNotes(res.data);
    } catch (err) {
      console.error("Erreur chargement notes", err);
    }
  };

  const fetchNoteById = async (noteId) => {
    try {
      const res = await axios.get(`http://localhost:5050/notes/${noteId}`);
      const note = res.data;
      setFormData({
        studentId: note.studentId?._id || '',
        classe: note.classe || '',
        categorie: note.categorie || 'premiercycle',
        ...note // S1malagasy, S1francais, ..., totalMoyenne
      });
      updateClasseOptions(note.categorie);
    } catch (err) {
      console.error("Erreur récupération note", err);
    }
  };

  const updateClasseOptions = (categorie) => {
    if(categorie === 'premiercycle') setClasseOptions(['6eme','5eme','4eme','3eme']);
    else setClasseOptions(['2nde','1ere','Terminale']);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if(name === 'categorie') {
      updateClasseOptions(value);
      setFormData(prev => ({ ...prev, classe:'', studentId:'' }));
    }
  };

  const calcMoyenneSemestre = (sem) => {
    let matieres = ['malagasy','francais','anglais','mathematique','physique','svt','histogeo','Eva','Religion'];
    if(formData.categorie === 'secondcycle') matieres.push('philosophie');
    const sum = matieres.reduce((acc,k)=>{
      const val = Number(formData[`${sem}${k}`]) || 0;
      return acc + val;
    },0);
    const divisor = formData.categorie === 'premiercycle' ? 9 : 10;
    return sum / divisor;
  };

  const sommeMoyennes = [1,2,3,4,5,6].reduce((acc,i)=>acc + calcMoyenneSemestre(`S${i}`),0);
  const moyenneFinale = diviseur > 0 ? (sommeMoyennes / diviseur) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const noteData = { ...formData };
    for(let i=1;i<=6;i++){
      noteData[`S${i}moyenne`] = calcMoyenneSemestre(`S${i}`);
    }
    noteData.totalMoyenne = moyenneFinale;
    noteData.statut = moyenneFinale >= 10 ? 'passe':'redouble';

    try {
      if (id) {
        await axios.put(`http://localhost:5050/notes/${id}`, noteData);
        alert("Note modifiée avec succès !");
      } else {
        await axios.post('http://localhost:5050/notes', noteData);
        alert("Note ajoutée avec succès !");
      }
      navigate('/admin/note');
    } catch(err) {
      console.error("Erreur lors de l'enregistrement des notes", err);
      alert("Erreur lors de l'enregistrement des notes.");
    }
  };

  const studentsFiltered = students.filter(s => 
    s.classe === formData.classe && 
    !notes.some(n => n.studentId?._id === s._id)
  );
  

  const matieres = ['malagasy','francais','anglais','mathematique','physique','svt','histogeo','Eva','Religion'];
  if(formData.categorie === 'secondcycle') matieres.push('philosophie');

  return (
    <div className="add-note">
  <h2>{id ? "Modifier une note" : "Ajouter une note"}</h2>
  <form onSubmit={handleSubmit}>

    {/* Cycle */}
    <div className="form-group">
      <label>Cycle :</label>
      {id ? (
        <input
          type="text"
          value={formData.categorie === 'premiercycle' ? 'Premier Cycle' : 'Second Cycle'}
          readOnly
        />
      ) : (
        <select name="categorie" value={formData.categorie} onChange={handleChange}>
          <option value="premiercycle">Premier Cycle</option>
          <option value="secondcycle">Second Cycle</option>
        </select>
      )}
    </div>

    {/* Classe */}
    <div className="form-group">
      <label>Classe :</label>
      {id ? (
        <input
          type="text"
          value={formData.classe}
          readOnly
        />
      ) : (
        <select name="classe" value={formData.classe} onChange={handleChange}>
          <option value="">--Choisir--</option>
          {classeOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
    </div>

    {/* Étudiant */}
    <div className="form-group">
      <label>Étudiant :</label>
      {id ? (
        <input
          type="text"
          value={formData.studentId?.name || 'Chargement...'}
          readOnly
        />
      ) : (
        <select name="studentId" value={formData.studentId} onChange={handleChange}>
          <option value="">--Choisir--</option>
          {studentsFiltered.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      )}
    </div>

    {/* Semestres en grille */}
    <div className="semestres-grid">
      {[1,2,3,4,5,6].map(sem => (
        <div key={sem} className={`semestre-box semestre-${sem}`}>
          <fieldset>
            <legend>Semestre {sem}</legend>
            {matieres.map(matiere => (
              <div key={matiere} className="matiere-row">
                <label>{matiere} :</label>
                <input
                  type="number"
                  name={`S${sem}${matiere}`}
                  value={formData[`S${sem}${matiere}`]}
                  onChange={handleChange}
                  min="0"
                  max="20"
                />
              </div>
            ))}
            <div className="moyenne-row">
              <label>Moyenne Semestre {sem} :</label>
              <input
                type="number"
                value={calcMoyenneSemestre(`S${sem}`).toFixed(2)}
                readOnly
              />
            </div>
          </fieldset>
        </div>
      ))}
    </div>

    {/* Bloc récapitulatif */}
    <div className="recap-box">
      <div>
        <label>Somme des moyennes :</label>
        <input
          type="number"
          value={sommeMoyennes.toFixed(2)}
          readOnly
        />
      </div>

      <div>
        <label>Semestre fini :</label>
        <input
          type="number"
          min="1"
          max="6"
          value={diviseur}
          onChange={(e)=>setDiviseur(Number(e.target.value))}
        />
      </div>

      <div>
        <label>Moyenne Totale :</label>
        <input
          type="number"
          value={moyenneFinale.toFixed(2)}
          readOnly
        />
      </div>
    </div>

    {/* Boutons */}
    <div className="actions">
      <button type="submit">{id ? "Modifier" : "Ajouter"}</button>
      <button
        type="button"
        className="btn-cancel"
        onClick={() => navigate("/admin/note")}
      >
        Annuler
      </button>
    </div>
  </form>
</div>

  );
};

export default AddNote;
