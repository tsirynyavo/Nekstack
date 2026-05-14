import { useEffect, useState } from "react";
import axios from "axios";
import "../components/CongesEmploye.css";

const CongesEmploye = ({ employeId }) => {
  const [conges, setConges] = useState([]);
  const [employe, setEmploye] = useState(null);
  const [joursFeries, setJoursFeries] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // État pour le formulaire intégré
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    type: "Annuel",
    dateDebut: "",
    dateFin: "",
    description: ""
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 🔹 Récupérer l'employé, les congés et les jours fériés
  useEffect(() => {
    if (!employeId) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchEmploye(),
          fetchConges(),
          fetchJoursFeries()
        ]);
      } catch (err) {
        console.error("Erreur chargement données:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [employeId, refreshKey]);

  const fetchEmploye = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/employees/${employeId}`);
      setEmploye(res.data);
    } catch (err) {
      console.error("Erreur employé:", err);
    }
  };

  const fetchConges = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/conges/all-by-employee/${employeId}`);
      console.log("TOUS les congés récupérés:", res.data);
      setConges(res.data || []);
    } catch (err) {
      console.error("Erreur congés:", err);
      try {
        const resFallback = await axios.get(`http://localhost:5050/conges`, {
          params: { 
            employeId: employeId,
            startDate: new Date(2024, 0, 1).toISOString(),
            endDate: new Date(2025, 11, 31).toISOString()
          }
        });
        setConges(resFallback.data.conges || []);
      } catch (fallbackErr) {
        console.error("Erreur fallback:", fallbackErr);
        setConges([]);
      }
    }
  };

  const fetchJoursFeries = async () => {
    try {
      const res = await axios.get("http://localhost:5050/jours-feries");
      const jf = Array.isArray(res.data)
        ? res.data
        : (res.data?.joursFeries || []);
      setJoursFeries(jf);
    } catch (err) {
      console.error("Erreur jours fériés:", err);
      setJoursFeries([]);
    }
  };

  // Fonctions pour le formulaire intégré
  const handleAdd = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(date);
    setFormData({
      type: "Annuel",
      dateDebut: dateStr,
      dateFin: dateStr,
      description: ""
    });
    setShowForm(true);
    setFormError("");
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedDate(null);
    setFormData({
      type: "Annuel",
      dateDebut: "",
      dateFin: "",
      description: ""
    });
    setFormError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    if (!employeId) {
      setFormError("Employé non identifié !");
      setFormLoading(false);
      return;
    }

    // Validation des dates
    if (new Date(formData.dateDebut) > new Date(formData.dateFin)) {
      setFormError("La date de fin doit être après la date de début");
      setFormLoading(false);
      return;
    }

    // Ajustement des dates pour le timezone
    const adjustDateForTimezone = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Date(date.getTime() + (60 * 60 * 1000)).toISOString().slice(0, 10);
    };

    const payload = {
      employeId,
      type: formData.type,
      dateDebut: adjustDateForTimezone(formData.dateDebut),
      dateFin: adjustDateForTimezone(formData.dateFin),
      description: formData.description,
      statut: "en_attente"
    };

    console.log("Payload envoyé:", payload);

    try {
      await axios.post("http://localhost:5050/conges/add-conge", payload);
      setShowSuccessModal(true);
      setShowForm(false);
      // Recharger les données
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error("Erreur soumission:", err);
      setFormError(err.response?.data?.error || "Erreur serveur lors de l'envoi de la demande");
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Si on change la date de début et que la date de fin est vide ou antérieure, on met à jour
    if (field === 'dateDebut' && (!formData.dateFin || new Date(value) > new Date(formData.dateFin))) {
      setFormData(prev => ({
        ...prev,
        dateFin: value
      }));
    }
  };

  // ... le reste de vos fonctions existantes (prevMonth, nextMonth, isFerie, etc.)

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    setMonth(prev => {
      if (prev === 0) {
        setYear(year - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const nextMonth = () => {
    setMonth(prev => {
      if (prev === 11) {
        setYear(year + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const isFerie = (date) => {
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);
    
    return joursFeries.some(jf => {
      const jfStart = new Date(jf.dateDebut);
      const jfEnd = new Date(jf.dateFin);
      jfStart.setHours(0, 0, 0, 0);
      jfEnd.setHours(0, 0, 0, 0);
      
      return currentDate >= jfStart && currentDate <= jfEnd;
    });
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Recharger quand on revient sur la page
  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (loading) {
    return (
      <div className="listconge-containerx">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (!employe) {
    return (
      <div className="listconge-containerx">
        <div className="error">Employé non trouvé</div>
      </div>
    );
  }

  // Filtrer les congés pour le mois affiché
  const congesDuMois = conges.filter(conge => {
    if (!conge.dateDebut || !conge.dateFin) return false;
    
    const start = new Date(conge.dateDebut);
    const end = new Date(conge.dateFin);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    return (start <= monthEnd && end >= monthStart);
  });

  return (
    <div className="listconge-containerx">
      {/* Header avec bouton pour ouvrir le formulaire */}
      <div className="header-controlsx">
        <div className="left-controlsx">
          <button 
            onClick={() => setShowForm(true)}
            className="add-conge-btn-main"
          >
            📝 Nouvelle demande
          </button>
          <button onClick={handleRefresh} className="refresh-btnx">
            🔄 Actualiser
          </button>
        </div>
        
        <div className="month-navigationx">
          <button onClick={prevMonth}>⬅ Mois précédent</button>
          <h2>{new Date(year, month).toLocaleString("fr-FR", { month: "long", year: "numeric" })}</h2>
          <button onClick={nextMonth}>Mois suivant ➡</button>
        </div>
      </div>

     

      {/* Formulaire intégré en modal */}
      {showForm && (
        <div className="form-modal-overlay">
          <div className="form-modal-content">
            <div className="form-modal-header">
              <h3>Nouvelle demande de congé</h3>
              <button onClick={handleCloseForm} className="close-btn">×</button>
            </div>
            
          

            {formError && <div className="error-message">{formError}</div>}

            <form onSubmit={handleFormSubmit} className="integrated-form">
              <div className="form-group">
                <label>Type de congé :</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => handleFormChange('type', e.target.value)} 
                  required
                >
                  <option value="Annuel">Congé payé</option>
                  <option value="Maladie">Maladie</option>
                  <option value="Exceptionnel">Cas exceptionnel</option>
                  <option value="Absence">Absence imprévue</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date début :</label>
                <input
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => handleFormChange('dateDebut', e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Date fin :</label>
                <input
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => handleFormChange('dateFin', e.target.value)}
                  required
                  min={formData.dateDebut}
                />
              </div>

              <div className="form-group">
                <label>Description :</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Raison du congé (optionnel)"
                  rows="3"
                />
              </div>

              <div className="form-buttons">
                <button type="submit" disabled={formLoading}>
                  {formLoading ? "Envoi en cours..." : "Envoyer la demande"}
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseForm}
                  disabled={formLoading}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <h3>✅ Demande envoyée avec succès !</h3>
            <p>Votre demande de congé a été enregistrée et est en attente de validation.</p>
            <button onClick={() => setShowSuccessModal(false)}>OK</button>
          </div>
        </div>
      )}

      {/* Le reste de votre composant existant */}
      <div className="table-containerx">
        <table className="calendar-tablex">
          <thead>
            <tr>
              <th>Jours du mois</th>
              {days.map(d => (
                <th key={d} className="day-headerx">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="employee-namex">{employe.prenom} {employe.nom}</td>
              {days.map(d => {
                const currentDate = new Date(year, month, d);
                currentDate.setHours(12, 0, 0, 0);

                const conge = conges.find(c => {
                  if (!c.dateDebut || !c.dateFin) return false;
                  
                  const start = new Date(c.dateDebut);
                  const end = new Date(c.dateFin);
                  start.setHours(0, 0, 0, 0);
                  end.setHours(23, 59, 59, 999);
                  
                  return currentDate >= start && currentDate <= end;
                });

                const ferie = isFerie(currentDate);
                const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const currentDateCopy = new Date(currentDate);
                currentDateCopy.setHours(0, 0, 0, 0);
                const isPast = currentDateCopy < today;

                let cellClass = "day-cell";
                if (ferie) {
                  cellClass += " ferie";
                } else if (isWeekend) {
                  cellClass += " weekend";
                } else if (conge) {
                  if (conge.statut === "accepté") {
                    cellClass += " accepte";
                  } else if (conge.statut === "en_attente") {
                    cellClass += " en-attente";
                  } else if (conge.statut === "refusé") {
                    cellClass += " refuse";
                  }
                } else if (isPast) {
                  cellClass += " past-day";
                }

                return (
                  <td key={d} className={cellClass}>
                    <div className="day-contentx">
                      {conge && (
                        <span className="mini-labelx" title={`${conge.type} - ${conge.statut}`}>
                          {conge.statut === "accepté" ? "A" : 
                           conge.statut === "en_attente" ? "E" : "R"}
                        </span>
                      )}
                    
                      {!conge && !ferie && !isWeekend && !isPast && (
                        <button
                          className="add-conge-btnx"
                          onClick={() => handleAdd(currentDate)}
                          title="Demander un congé"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="legendx">
        <span className="badge accepte">Accepté</span>
        <span className="badge en-attente">En attente</span>
        <span className="badge refuse">Refusé</span>
        <span className="badge ferie">Jour férié</span>
        <span className="badge weekend">Weekend</span>
        <span className="badge past-day">Passé</span>
      </div>

      <div className="recent-congesx">
        <h4>📅 Tous mes congés ({conges.length}) :</h4>
        {conges.length === 0 ? (
          <p>Aucune demande de congé</p>
        ) : (
          <div className="conges-listx">
            {conges.map((conge) => (
              <div key={conge._id} className="conge-itemx">
                <span className={`status-${conge.statut}`}>
                  {conge.statut === "accepté" ? "✅" : 
                   conge.statut === "en_attente" ? "⏳" : "❌"}
                </span>
                {new Date(conge.dateDebut).toLocaleDateString()} - {new Date(conge.dateFin).toLocaleDateString()}
                <span className="conge-typex">({conge.type}) - {conge.statut}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CongesEmploye;