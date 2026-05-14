import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../components/PresenceEmploye.css";

const PresenceEmploye = ({ employeId }) => {
  const navigate = useNavigate();
  const [employe, setEmploye] = useState(null);
  const [presences, setPresences] = useState([]);
  const [conges, setConges] = useState([]);
  const [joursFeries, setJoursFeries] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // 🔥 AJOUT : Fonctions utilitaires manquantes
  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getStatusAbbreviation = (status) => {
    const abbreviations = {
      'present': 'P',
      'present-matin': 'M',
      'present-soir': 'S',
      'absent': 'A',
      'conge': 'C',
      'ferie': 'F',
      'weekend': 'W'
    };
    return abbreviations[status] || '?';
  };

  const formatHeuresPointageCompact = (presence) => {
    if (!presence) return '-';
    
    let result = [];
    if (presence.presentMatin && presence.heureEntreeMatin) {
      result.push(`M:${presence.heureEntreeMatin.substring(0, 5)}`);
    }
    if (presence.presentSoir && presence.heureEntreeSoir) {
      result.push(`S:${presence.heureEntreeSoir.substring(0, 5)}`);
    }
    
    return result.length > 0 ? result.join(' ') : '-';
  };

  const formatRetardsCompact = (presence) => {
    if (!presence) return '-';
    
    const totalRetard = (presence.retardMatin || 0) + (presence.retardSoir || 0);
    
    if (totalRetard > 0) {
      return `${totalRetard}m`;
    }
    
    return '✓';
  };

  // Charger l'employé
  useEffect(() => {
    const fetchEmploye = async () => {
      try {
        if (employeId) {
          const res = await axios.get(`http://localhost:5050/employees/${employeId}`);
          setEmploye(res.data);
        } else {
          const stored = localStorage.getItem("employe");
          if (stored) setEmploye(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Erreur chargement employé:", err);
      }
    };

    fetchEmploye();
  }, [employeId]);

  // Charger les données (présences, congés, jours fériés)
  useEffect(() => {
    if (!employe) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [presRes, congesRes, joursRes] = await Promise.all([
          axios.get(`http://localhost:5050/presences/all-by-employee/${employe._id}`, { 
            params: { 
              startDate: new Date(year, month, 1).toISOString(),
              endDate: new Date(year, month + 1, 0).toISOString()
            } 
          }),
          axios.get(`http://localhost:5050/conges/all-by-employee/${employe._id}`),
          axios.get(`http://localhost:5050/jours-feries`)
        ]);

        // ✅ Vérifications et affectations sûres
        setPresences(Array.isArray(presRes.data) ? presRes.data : []);
        setConges(Array.isArray(congesRes.data) ? congesRes.data : []);

        // 🔥 ICI : on vérifie si c'est bien un tableau
        const jf = Array.isArray(joursRes.data)
          ? joursRes.data
          : (joursRes.data?.joursFeries || []);

        setJoursFeries(jf);
      } catch (err) {
        console.error("Erreur chargement données:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employe, month, year]);

  // Navigation mois
  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setMonth(today.getMonth());
    setYear(today.getFullYear());
  };

  // Jours dans le mois
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isWeekend = (date) => [0, 6].includes(new Date(date).getDay());

  const isFerie = (date) => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return joursFeries.some(jf => {
      if (jf.date) return new Date(jf.date).toDateString() === d.toDateString();
      if (jf.dateDebut && jf.dateFin) {
        const start = new Date(jf.dateDebut);
        const end = new Date(jf.dateFin);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return d >= start && d <= end;
      }
      return false;
    });
  };

  const isConge = (date) => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return conges.some(c => {
      if (!c.dateDebut || !c.dateFin) return false;
      const start = new Date(c.dateDebut);
      const end = new Date(c.dateFin);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end && ["accepté", "accepte", "en_attente"].includes(c.statut.toLowerCase());
    });
  };

  // Récupérer la présence pour un jour (une seule présence par jour maintenant)
  const getPresenceForDay = (day) => {
    const date = new Date(year, month, day);
    return presences.find(p => {
      const presenceDate = new Date(p.date);
      return presenceDate.toDateString() === date.toDateString();
    });
  };

  // Déterminer le statut pour un jour
  const getStatusForDay = (day) => {
    const date = new Date(year, month, day);
    
    if (isFerie(date)) return { type: "ferie", label: "Férié" };
    if (isConge(date)) return { type: "conge", label: "Congé" };
    if (isWeekend(date)) return { type: "weekend", label: "Weekend" };
    
    const presence = getPresenceForDay(day);
    if (presence) {
      // Adapter les statuts au système 2 boutons
      if (presence.statut === 'present-journee') {
        return { type: "present", label: "Présent(e)" };
      } else if (presence.statut === 'present-matin') {
        return { type: "present-matin", label: "Présent(e) matin" };
      } else if (presence.statut === 'present-soir') {
        return { type: "present-soir", label: "Présent(e) après-midi" };
      } else {
        return { type: "absent", label: "Absent(e)" };
      }
    }
    
    return { type: "absent", label: "Absent(e)" };
  };

  // Formater les heures de pointage (version détaillée)
  const formatHeuresPointage = (presence) => {
    if (!presence) return "-";
    
    const heures = [];
    if (presence.presentMatin && presence.heureEntreeMatin) {
      heures.push(`Matin: ${presence.heureEntreeMatin.substring(0, 5)}`);
    }
    if (presence.presentSoir && presence.heureEntreeSoir) {
      heures.push(`Soir: ${presence.heureEntreeSoir.substring(0, 5)}`);
    }
    
    return heures.length > 0 ? heures.join(' | ') : "-";
  };

  // Afficher les retards (version détaillée)
  const formatRetards = (presence) => {
    if (!presence) return "";
    
    const retards = [];
    if (presence.retardMatin > 0) {
      retards.push(`Matin: +${presence.retardMatin}min`);
    }
    if (presence.retardSoir > 0) {
      retards.push(`Soir: +${presence.retardSoir}min`);
    }
    
    return retards.length > 0 ? retards.join(' | ') : "✅ Ponctuel";
  };

  if (!employe) return <div className="loading">Employé non connecté</div>;
  if (loading) return <div className="loading">Chargement...</div>;

  return (<div className="xpresence-employee-container">
  <div className="xprofile-header">
    <div>
      <h2>Mes présences</h2>
      
    </div>
  </div>

  <div className="xmonth-navigation">
    <button onClick={prevMonth}>⬅ Mois précédent</button>
    <button onClick={goToToday}>Aujourd'hui</button>
    <h3>{new Date(year, month).toLocaleString("fr-FR", { month: "long", year: "numeric" })}</h3>
    <button onClick={nextMonth}>Mois suivant ➡</button>
  </div>

  {/* NOUVEAU : Calendrier horizontal comme les congés */}
  <div className="xcalendar-container-horizontal">
    <table className="xpresence-calendar-horizontal">
      <thead>
        <tr>
          <th className="xemployee-header">{employe.prenom} {employe.nom}</th>
          {days.map(day => {
            const date = new Date(year, month, day);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = isSameDay(date, new Date());
            
            return (
              <th 
                key={day} 
                className={`xday-header ${isWeekend ? 'xweekend' : ''} ${isToday ? 'xtoday' : ''}`}
              >
                <div className="xday-number">{day}</div>
                <div className="xday-name">
                  {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {/* Ligne Statut */}
        <tr className="xstatus-row">
          <td className="xrow-label">Statut</td>
          {days.map(day => {
            const date = new Date(year, month, day);
            const status = getStatusForDay(day);
            
            return (
              <td key={day} className={`xstatus-cell ${status.type}`}>
                <span className={`xstatus-badge ${status.type}`}>
                  {getStatusAbbreviation(status.type)}
                </span>
              </td>
            );
          })}
        </tr>
        
        {/* Ligne Heures */}
        <tr className="xhours-row">
          <td className="xrow-label">Heures</td>
          {days.map(day => {
            const presence = getPresenceForDay(day);
            
            return (
              <td key={day} className="xhours-cell">
                {formatHeuresPointageCompact(presence)}
              </td>
            );
          })}
        </tr>
        
        {/* Ligne Retards */}
        <tr className="xretards-row">
          <td className="xrow-label">Retards</td>
          {days.map(day => {
            const presence = getPresenceForDay(day);
            
            return (
              <td key={day} className="xretards-cell">
                {formatRetardsCompact(presence)}
              </td>
            );
          })}
        </tr>
      </tbody>
    </table>
  </div>

  {/* Légende adaptée */}
  <div className="xlegend">
    <div className="xlegend-item">
      <span className="xstatus-badge present"></span>
      <span>Présent(e)</span>
    </div>
    <div className="xlegend-item">
      <span className="xstatus-badge present-matin"></span>
      <span>Matin</span>
    </div>
    <div className="xlegend-item">
      <span className="xstatus-badge present-soir"></span>
      <span>Après-midi</span>
    </div>
    <div className="xlegend-item">
      <span className="xstatus-badge absent"></span>
      <span>Absent(e)</span>
    </div>
    <div className="xlegend-item">
      <span className="xstatus-badge conge"></span>
      <span>Congé</span>
    </div>
    <div className="xlegend-item">
      <span className="xstatus-badge ferie"></span>
      <span>Férié</span>
    </div>
    <div className="xlegend-item">
      <span className="xstatus-badge weekend"></span>
      <span>Weekend</span>
    </div>
  </div>
</div>)
};

export default PresenceEmploye;