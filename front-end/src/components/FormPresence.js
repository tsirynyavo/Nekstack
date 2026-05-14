import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../components/FormPresence.css";

const FormPresence = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [canAdd, setCanAdd] = useState(true);
  
  const [employes, setEmployes] = useState([]);
  const [employeId, setEmployeId] = useState("");
  const [date, setDate] = useState("");
  
  // NOUVEAUX CHAMPS pour le système 2 boutons
  const [heureEntreeMatin, setHeureEntreeMatin] = useState("");
  const [heureEntreeSoir, setHeureEntreeSoir] = useState("");
  const [presentMatin, setPresentMatin] = useState(false);
  const [presentSoir, setPresentSoir] = useState(false);
  
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Charger les employés
  useEffect(() => {
    axios
      .get("http://localhost:5050/employees")
      .then((res) => {
        setEmployes(res.data.employes || []);
      })
      .catch((err) => {
        console.error("Erreur chargement employés:", err);
        setError("Erreur lors du chargement des employés");
      });
  }, []);

  // Vérifier si date autorisée
  useEffect(() => {
    if (!date || !employeId) return;
  
    const checkDate = async () => {
      const d = new Date(date);
      const day = d.getDay();
      if (day === 0 || day === 6) {
        setCanAdd(false);
        setError("Impossible de modifier une présence pendant le weekend.");
        return;
      }
  
      try {
        const jourStart = new Date(date);
        jourStart.setHours(0,0,0,0);
        const jourEnd = new Date(date);
        jourEnd.setHours(23,59,59,999);
  
        const [jfRes, congRes] = await Promise.all([
          axios.get("http://localhost:5050/jours-feries", {
            params: { start: jourStart.toISOString(), end: jourEnd.toISOString() }
          }),
          axios.get("http://localhost:5050/conges/check", {
            params: { date: date, employeId }
          })
        ]);
  
        if (jfRes.data.length > 0) {
          setCanAdd(false);
          setError("Impossible de modifier la présence, jour férié.");
        } else if (congRes.data.inConge) {
          setCanAdd(false);
          setError("Impossible de modifier la présence, l'employé est en congé.");
        } else {
          setCanAdd(true);
          setError("");
        }
      } catch (err) {
        console.error(err);
        setCanAdd(true);
      }
    };
  
    checkDate();
  }, [date, employeId]);

  // Charger la présence si modification
  useEffect(() => {
    if (id) {
      setLoading(true);
      axios
        .get(`http://localhost:5050/presences/${id}`)
        .then((res) => {
          const p = res.data;
          setEmployeId(p.employe._id);
          setDate(p.date ? new Date(p.date).toISOString().split("T")[0] : "");
          
          // NOUVEAUX CHAMPS
          setHeureEntreeMatin(p.heureEntreeMatin || "");
          setHeureEntreeSoir(p.heureEntreeSoir || "");
          setPresentMatin(p.presentMatin || false);
          setPresentSoir(p.presentSoir || false);
          
          setNotes(p.notes || "");
        })
        .catch((err) => {
          console.error("Erreur chargement présence:", err);
          setError("Erreur lors du chargement de la présence");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // NOUVEAU PAYLOAD pour le système 2 boutons
    const payload = {
      date,
      heureEntreeMatin: presentMatin ? heureEntreeMatin : null,
      heureEntreeSoir: presentSoir ? heureEntreeSoir : null,
      presentMatin,
      presentSoir,
      notes,
    };

    try {
      await axios.put(`http://localhost:5050/presences/${id}`, payload);
      setModalMessage("Présence modifiée avec succès !");
      setShowModal(true);
    } catch (err) {
      console.error("Erreur soumission:", err);
      setError(err.response?.data?.error || "Erreur serveur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour gérer les cases à cocher
  const handleMatinChange = (e) => {
    const isChecked = e.target.checked;
    setPresentMatin(isChecked);
    if (!isChecked) {
      setHeureEntreeMatin(""); // Réinitialiser l'heure si désélectionné
    }
  };

  const handleSoirChange = (e) => {
    const isChecked = e.target.checked;
    setPresentSoir(isChecked);
    if (!isChecked) {
      setHeureEntreeSoir(""); // Réinitialiser l'heure si désélectionné
    }
  };

  return (<div className="presencex-form-container">
  <h2>Modifier la présence</h2>

  {loading && (
    <div className="presencex-loading-overlay">
      <div className="presencex-loading-spinner">Envoi en cours...</div>
    </div>
  )}

  {error && <div className="presencex-error">{error}</div>}

  <form onSubmit={handleSubmit}>
    <div className="presencex-form-group">
      <label>Employé :</label>
      <select
        value={employeId}
        onChange={(e) => setEmployeId(e.target.value)}
        required
        disabled={true}
      >
        <option value="">-- Choisir un employé --</option>
        {employes.map((emp) => (
          <option key={emp._id} value={emp._id}>
            {emp.nom} {emp.prenom} ({emp.matricule})
          </option>
        ))}
      </select>
    </div>

    <div className="presencex-form-group">
      <label>Date :</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        disabled={true}
      />
    </div>

    {/* Section Pointage Matin */}
    <div className="presencex-pointage-section">
      <h3>Pointage Matin</h3>
      <div className="presencex-checkbox-group">
        <label className="presencex-checkbox-label">
          <input
            type="checkbox"
            checked={presentMatin}
            onChange={handleMatinChange}
          />
          <span className="presencex-checkmark"></span>
          Présent le matin
        </label>
      </div>
      
      {presentMatin && (
        <div className="presencex-form-group">
          <label>Heure d'arrivée (Matin) :</label>
          <input
            type="time"
            value={heureEntreeMatin}
            onChange={(e) => setHeureEntreeMatin(e.target.value)}
            required={presentMatin}
          />
          <small>Heure théorique: 08:00</small>
        </div>
      )}
    </div>

    {/* Section Pointage Soir */}
    <div className="presencex-pointage-section">
      <h3>Pointage Après-midi</h3>
      <div className="presencex-checkbox-group">
        <label className="presencex-checkbox-label">
          <input
            type="checkbox"
            checked={presentSoir}
            onChange={handleSoirChange}
          />
          <span className="presencex-checkmark"></span>
          Présent l'après-midi
        </label>
      </div>
      
      {presentSoir && (
        <div className="presencex-form-group">
          <label>Heure d'arrivée (Après-midi) :</label>
          <input
            type="time"
            value={heureEntreeSoir}
            onChange={(e) => setHeureEntreeSoir(e.target.value)}
            required={presentSoir}
          />
          <small>Heure théorique: 14:00</small>
        </div>
      )}
    </div>

    <div className="presencex-form-group">
      <label>Notes :</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Observation (optionnel)"
        rows="3"
      />
    </div>

    {/* Affichage des retards calculés */}
    {(presentMatin || presentSoir) && (
      <div className="presencex-retard-info">
        <h4>Retards calculés :</h4>
        {presentMatin && heureEntreeMatin && (
          <p>Matin: {calculerRetard(heureEntreeMatin, "08:00")} minutes de retard</p>
        )}
        {presentSoir && heureEntreeSoir && (
          <p>Après-midi: {calculerRetard(heureEntreeSoir, "14:00")} minutes de retard</p>
        )}
      </div>
    )}

    <div className="presencex-form-buttons">
      <button type="submit" disabled={loading || !canAdd}>
        {loading ? "Envoi..." : "Modifier"}
      </button>

      <button
        type="button"
        onClick={() => navigate("/admin/presence")}
        disabled={loading}
      >
        Annuler
      </button>
    </div>
  </form>

  {showModal && (
    <div className="presencex-modal-backdrop">
      <div className="presencex-modal">
        <h3>{modalMessage}</h3>
        <button
          onClick={() => {
            setShowModal(false);
            navigate("/admin/presence");
          }}
        >
          OK
        </button>
      </div>
    </div>
  )}
</div> );} 

// Fonction utilitaire pour calculer le retard (affichage seulement)
const calculerRetard = (heureReelle, heureTheorique) => {
  if (!heureReelle) return 0;
  
  const [thH, thM] = heureTheorique.split(':').map(Number);
  const [reH, reM] = heureReelle.split(':').map(Number);
  
  const minutesTheoriques = thH * 60 + thM;
  const minutesReelles = reH * 60 + reM;
  
  return Math.max(0, minutesReelles - minutesTheoriques);
};

export default FormPresence;