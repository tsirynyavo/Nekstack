import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; 
import "../components/FormNoteInterne.css";

const FormNoteInterne = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [departements, setDepartements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [form, setForm] = useState({
    titre: "",
    contenu: "",
    departements: [],
    datePublication: new Date().toISOString().split('T')[0]
  });

  // Charger les départements
  useEffect(() => {
    axios.get("http://localhost:5050/departements")
      .then(res => {
        console.log("Départements reçus:", res.data);
        setDepartements(res.data);
        
        if (!id && res.data.length > 0) {
          setForm(prev => ({
            ...prev,
            departements: [res.data[0]._id]
          }));
        }
      })
      .catch(err => console.error("Erreur chargement départements:", err));
  }, [id]);

  // Charger la note si modification
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5050/notes-internes/${id}`)
        .then(res => {
          const data = res.data;
          setForm({
            titre: data.titre,
            contenu: data.contenu,
            departements: data.departements.map(dep => dep._id),
            datePublication: data.datePublication ? 
              new Date(data.datePublication).toISOString().split('T')[0] : 
              new Date().toISOString().split('T')[0]
          });
        })
        .catch(() => alert("Erreur de chargement de la note"));
    }
  }, [id]);

  // Gérer la sélection/désélection des départements
  const handleDepartementChange = (departementId) => {
    setForm(prevForm => {
      const isSelected = prevForm.departements.includes(departementId);
      
      if (isSelected) {
        if (prevForm.departements.length === 1) {
          setModalMessage("Au moins un département doit être sélectionné ❌");
          setShowModal(true);
          return prevForm;
        }
        
        return {
          ...prevForm,
          departements: prevForm.departements.filter(id => id !== departementId)
        };
      } else {
        return {
          ...prevForm,
          departements: [...prevForm.departements, departementId]
        };
      }
    });
  };

  const selectAllDepartements = () => {
    const allIds = departements.map(dep => dep._id);
    setForm(prevForm => ({
      ...prevForm,
      departements: allIds
    }));
  };

  const clearAllDepartements = () => {
    setModalMessage("Au moins un département doit être sélectionné ❌");
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!form.titre || !form.contenu) {
      setModalMessage("Le titre et le contenu sont requis ❌");
      setShowModal(true);
      return;
    }

    if (!form.departements || form.departements.length === 0) {
      setModalMessage("Au moins un département doit être sélectionné ❌");
      setShowModal(true);
      return;
    }

    const url = id ? `http://localhost:5050/notes-internes/${id}` : "http://localhost:5050/notes-internes";
    const method = id ? axios.put : axios.post;
  
    method(url, form)
    .then(() => {
      setModalMessage(id ? "Note modifiée avec succès ✅" : "Note créée avec succès ✅");
      setShowModal(true);
    })
    .catch(err => {
      console.error(err.response?.data || err);
      setModalMessage(err.response?.data?.error || "Erreur lors de l'enregistrement ❌");
      setShowModal(true);
    });
  };

  return (
    <div className="nsote-form-container">
      <div className="noste-form">
        <form onSubmit={handleSubmit}>
          <h2>{id ? "Modifier" : "Créer"} une note interne</h2>
  
          <div className="fsorm-grid">
            <div className="fsorm-column">
               <span>Titre de la note *</span><i></i>
              <div className="insputBox">
                <input 
                  type="text" 
                  value={form.titre} 
                  onChange={e => setForm({ ...form, titre: e.target.value })} 
                  required 
                />
               
              </div>
  
              <div className="inpsutBox textarea-box">
                <span>Contenu de la note *</span><i></i>
                <textarea 
                  value={form.contenu} 
                  onChange={e => setForm({ ...form, contenu: e.target.value })} 
                  rows="8"
                  required
                />
                
              </div>

              <div className="inpsutBox">     <span>Date de publication *</span><i></i>
                <input 
                  type="date" 
                  value={form.datePublication} 
                  onChange={e => setForm({ ...form, datePublication: e.target.value })} 
                  required 
                />
           
              </div>
            </div>
  
            <div className="forssm-column">
              <div className="depsartements-section">
                <h3>Départements cibles *</h3>
                <p className="heslp-text mandatory-text">
                  ⚠️ Au moins un département doit être sélectionné
                </p>
                
                <div className="despartements-actions">
                  <button type="button" onClick={selectAllDepartements} className="bccctn btn-small">
                    Tout sélectionner
                  </button>
               
                </div>
  
                <div className="dccepartements-list">
                  {departements.map(departement => (
                    <label key={departement._id} className="deccpartement-checkbox">
                      <input
                        type="checkbox"
                        checked={form.departements.includes(departement._id)}
                        onChange={() => handleDepartementChange(departement._id)}
                        disabled={form.departements.length === 1 && form.departements.includes(departement._id)}
                      />
                      <span className="chcceckmark"></span>
                      {departement.nom}
                    </label>
                  ))}
                </div>

                <div className="secclection-summary">
                  <strong>
                    {form.departements.length === 0 ? (
                      <span style={{ color: "red" }}>❌ Aucun département sélectionné</span>
                    ) : (
                      `✅ Visible pour ${form.departements.length} département(s)`
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>
  
          <div className="bscquttons">
            <button 
              type="submit" 
              className="btqscqn-glow"
              disabled={form.departements.length === 0}
            >
              {id ? "Modifier" : "Créer"} la note
            </button>
            <button 
              type="button" 
              className="bsctn-cancel" 
              onClick={() => navigate("/admin/notes-internes")}
            >
              Annuler
            </button>
          </div>
        </form>
  
        {showModal && (
          <div className="moxdal-overlay">
            <div className="mxodal">
              <h3>{modalMessage}</h3>
              <div className="moxdal-buttons">
                <button
                  onClick={() => {
                    setShowModal(false);
                    if (modalMessage.includes("succès")) {
                      navigate("/admin/notes-internes");
                    }
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormNoteInterne;