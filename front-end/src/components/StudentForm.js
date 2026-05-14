import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import '../components/StudentForm.css'; // <-- importe ton CSS ici



const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const classesPremierCycle = ["6eme", "5eme", "4eme", "3eme"];
  const classesSecondCycle = ["2nde", "1ere", "Terminale"];

  const [form, setForm] = useState({
    matricule: "",
    name: "",
    lastname: "",
    sexe: "Homme",
    classe: "6eme",
    categorie: "premiercycle",
    numerotel: "",
    adresse: "",
    datenaissance: "",
    lieunaissance: "",
    annee: new Date().getFullYear()
  });

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:5050/students/${id}`)
        .then((res) => {
          const data = res.data;
          if (data.datenaissance) {
            data.datenaissance = new Date(data.datenaissance)
              .toISOString()
              .split("T")[0];
          }
          setForm(data);
        })
        .catch(() => alert("Erreur de chargement"));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      annee: Number(form.annee),
      datenaissance: new Date(form.datenaissance)
    };

    const url = id
      ? `http://localhost:5050/students/${id}`
      : "http://localhost:5050/add-student";
    const method = id ? axios.put : axios.post;

    method(url, payload)
      .then(() => {
        alert(id ? "Étudiant modifié" : "Étudiant ajouté");
        navigate("/admin/etudiants");
      })
      .catch((err) => {
        console.error(err.response?.data || err);
        alert(err.response?.data?.error || "Erreur lors de l'enregistrement");
      });
  };

  // Fonction pour récupérer les classes selon la catégorie
  const classesDisponibles =
    form.categorie === "premiercycle" ? classesPremierCycle : classesSecondCycle;

  // Réinitialiser la classe si elle n'est pas dans le cycle sélectionné
  useEffect(() => {
    if (!classesDisponibles.includes(form.classe)) {
      setForm({ ...form, classe: classesDisponibles[0] });
    }
  }, [form.categorie]); // se déclenche quand la catégorie change

  return (
    <div className="student-form">
      <form onSubmit={handleSubmit}>
        <h2>{id ? "Modifier" : "Ajouter"} un étudiant</h2>

        {/* Matricule */}
        <div className="inputBox">
          <input
            type="text"
            value={form.matricule}
            onChange={(e) => setForm({ ...form, matricule: e.target.value })}
            required
          />
          <span>Matricule</span>
          <i></i>
        </div>

        {/* Nom */}
        <div className="inputBox">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <span>Nom</span>
          <i></i>
        </div>

        {/* Prénom */}
        <div className="inputBox">
          <input
            type="text"
            value={form.lastname}
            onChange={(e) => setForm({ ...form, lastname: e.target.value })}
            required
          />
          <span>Prénom</span>
          <i></i>
        </div>

        {/* Sexe */}
        <div className="inputBox">
          <select
            value={form.sexe}
            onChange={(e) => setForm({ ...form, sexe: e.target.value })}
            required
          >
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>
          <span>Sexe</span>
          <i></i>
        </div>

        {/* Catégorie */}
        <div className="inputBox">
          <select
            value={form.categorie}
            onChange={(e) => setForm({ ...form, categorie: e.target.value })}
            required
          >
            <option value="premiercycle">Premier cycle</option>
            <option value="secondcycle">Second cycle</option>
          </select>
          <span>Catégorie</span>
          <i></i>
        </div>

        {/* Classe */}
        <div className="inputBox">
          <select
            value={form.classe}
            onChange={(e) => setForm({ ...form, classe: e.target.value })}
            required
          >
            {classesDisponibles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span>Classe</span>
          <i></i>
        </div>

        {/* Numéro téléphone */}
        <div className="inputBox">
          <input
            type="text"
            value={form.numerotel}
            onChange={(e) => setForm({ ...form, numerotel: e.target.value })}
            required
          />
          <span>Numéro téléphone</span>
          <i></i>
        </div>

        {/* Adresse */}
        <div className="inputBox">
          <input
            type="text"
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            required
          />
          <span>Adresse</span>
          <i></i>
        </div>

        {/* Date de naissance */}
        <div className="inputBox">
          <input
            type="date"
            value={form.datenaissance}
            onChange={(e) => setForm({ ...form, datenaissance: e.target.value })}
            required
          />
          <span>Date de naissance</span>
          <i></i>
        </div>

        {/* Lieu de naissance */}
        <div className="inputBox">
          <input
            type="text"
            value={form.lieunaissance}
            onChange={(e) => setForm({ ...form, lieunaissance: e.target.value })}
            required
          />
          <span>Lieu de naissance</span>
          <i></i>
        </div>

        {/* Année scolaire */}
        <div className="inputBox">
          <input
            type="number"
            value={form.annee}
            onChange={(e) => setForm({ ...form, annee: e.target.value })}
            required
          />
          <span>Année scolaire</span>
          <i></i>
        </div>

        <div className="buttons">
          <button type="submit" className="btn-glow">
            {id ? "Modifier" : "Ajouter"}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/etudiants")}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
