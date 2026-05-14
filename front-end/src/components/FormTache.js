import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; 
import "../components/FormTache.css";

const FormTache = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [departements, setDepartements] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    assignationType: "personne",
    employe_id: "",
    departement_id: "",
    priorite: "normale",
    dateLimite: new Date().toISOString().split('T')[0]
  });

  // ⭐⭐ FONCTION pour récupérer TOUS les employés actifs
  const fetchAllActiveEmployees = async () => {
    setLoading(true);
    try {
      console.log("🔍 Chargement de tous les employés actifs pour les tâches...");
      
      let allEmployees = [];
      let page = 1;
      let totalPages = 1;
      
      do {
        const res = await axios.get("http://localhost:5050/employees", {
          params: { 
            page, 
            limit: 100,
            statut: "actif"
          }
        });
        
        console.log(`📄 Page ${page}/${res.data.pages || 1}: ${res.data.employes?.length || 0} employés`);
        
        if (res.data.employes) {
          allEmployees = [...allEmployees, ...res.data.employes];
        } else if (Array.isArray(res.data)) {
          allEmployees = [...allEmployees, ...res.data];
        }
        
        totalPages = res.data.pages || 1;
        page++;
        
      } while (page <= totalPages);
      
      console.log(`✅ ${allEmployees.length} employés actifs chargés pour les tâches`);
      
      // Vérifier que tous les employés ont un statut actif
      const activeEmployees = allEmployees.filter(emp => 
        emp.statut === "actif" || emp.statut === "en_conge"
      );
      
      if (activeEmployees.length < allEmployees.length) {
        console.warn(`⚠️ ${allEmployees.length - activeEmployees.length} employés non-actifs filtrés`);
      }
      
      return activeEmployees;
      
    } catch (err) {
      console.error("❌ Erreur chargement employés:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Charger les départements et employés
  useEffect(() => {
    // Charger les départements
    axios.get("http://localhost:5050/departements")
      .then(res => {
        setDepartements(res.data);
      })
      .catch(err => console.error("Erreur chargement départements:", err));

    // ⭐ MODIFIÉ: Récupérer TOUS les employés actifs
    fetchAllActiveEmployees()
      .then(allActiveEmployees => {
        setEmployes(allActiveEmployees);
        console.log(`🎯 ${allActiveEmployees.length} employés disponibles pour assignation`);
      })
      .catch(err => console.error("Erreur chargement employés:", err));
  }, []);

  // ⭐ AJOUT: Indicateur du nombre d'employés actifs
  const employesActifsCount = employes.filter(emp => emp.statut === "actif").length;

  // Charger la tâche si modification
  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`http://localhost:5050/taches/${id}`)
        .then(res => {
          const data = res.data;
          setForm({
            titre: data.titre,
            description: data.description,
            assignationType: data.assignationType,
            employe_id: data.employe_id?._id || "",
            departement_id: data.departement_id?._id || "",
            priorite: data.priorite,
            dateLimite: data.dateLimite ? 
              new Date(data.dateLimite).toISOString().split('T')[0] : 
              new Date().toISOString().split('T')[0]
          });
        })
        .catch(() => {
          setModalMessage("Erreur de chargement de la tâche ❌");
          setShowModal(true);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!form.titre || !form.description || !form.dateLimite) {
      setModalMessage("Le titre, la description et la date limite sont requis ❌");
      setShowModal(true);
      return;
    }

    // Validation selon le type d'assignation
    if (form.assignationType === 'personne' && !form.employe_id) {
      setModalMessage("Veuillez sélectionner un employé ❌");
      setShowModal(true);
      return;
    }
    
    if (form.assignationType === 'departement' && !form.departement_id) {
      setModalMessage("Veuillez sélectionner un département ❌");
      setShowModal(true);
      return;
    }

    setLoading(true);
    
    const url = id ? `http://localhost:5050/taches/${id}` : "http://localhost:5050/taches";
    const method = id ? axios.put : axios.post;
  
    method(url, form)
    .then(() => {
      setModalMessage(id ? "Tâche modifiée avec succès ✅" : "Tâche créée avec succès ✅");
      setShowModal(true);
    })
    .catch(err => {
      console.error(err.response?.data || err);
      setModalMessage(err.response?.data?.error || "Erreur lors de l'enregistrement ❌");
      setShowModal(true);
    })
    .finally(() => setLoading(false));
  };

  const handleAssignationTypeChange = (type) => {
    setForm({
      ...form,
      assignationType: type,
      employe_id: type === 'personne' ? form.employe_id : "",
      departement_id: type === 'departement' ? form.departement_id : ""
    });
  };

  return (
    <div className="tache-forms-container">
      <div className="tache-sform">
        <form onSubmit={handleSubmit}>
          <h2>{id ? "Modifier" : "Créer"} une tâche</h2>
          
          {/* Debug info */}
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            <strong>Debug:</strong> {employes.length} employés disponibles pour assignation
            {loading && " (Chargement en cours...)"}
          </div>
  
          <div className="forsm-grid">
            <div className="fosrm-column">
              <div className="isnputBox">
                <span>Titre de la tâche *</span>
                <input 
                  type="text" 
                  value={form.titre} 
                  onChange={e => setForm({ ...form, titre: e.target.value })} 
                  required 
                  disabled={loading}
                />
              </div>
  
              <div className="inputBoscx textarea-box">
                <span>Description de la tâche *</span>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  rows="6"
                  required
                  disabled={loading}
                />
              </div>

              <div className="inpuxstBox">
                <span>Date limite *</span>
                <input 
                  type="date" 
                  value={form.dateLimite} 
                  onChange={e => setForm({ ...form, dateLimite: e.target.value })} 
                  required 
                  disabled={loading}
                />
              </div>

              <div className="inpustBox">
                <span>Priorité *</span>
                <select 
                  value={form.priorite} 
                  onChange={e => setForm({ ...form, priorite: e.target.value })}
                  required
                  disabled={loading}
                >
                  <option value="basse">Basse</option>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>
  
            <div className="form-columsn">
              <div className="assignatssion-section">
                <h3>Assignation de la tâche *</h3>
                
                <div className="assignsation-type-selector">
                  <label className="asssignation-option">
                    <input
                      type="radio"
                      name="assignationType"
                      value="personne"
                      checked={form.assignationType === 'personne'}
                      onChange={() => handleAssignationTypeChange('personne')}
                      disabled={loading}
                    />
                    <span className="radssio-checkmark"></span>
                    À une personne spécifique
                  </label>

                  <label className="assignsation-option">
                    <input
                      type="radio"
                      name="assignationType"
                      value="departement"
                      checked={form.assignationType === 'departement'}
                      onChange={() => handleAssignationTypeChange('departement')}
                      disabled={loading}
                    />
                    <span className="radio-chseckmark"></span>
                    À un département entier
                  </label>
                </div>

                {/* Champ employé */}
                {form.assignationType === 'personne' && (
                  <div className="inpustBox">
                    <select 
                      value={form.employe_id} 
                      onChange={e => setForm({ ...form, employe_id: e.target.value })}
                      required
                      disabled={loading}
                    >
                      <option value="">Sélectionner un employé</option>
                      {employes.map(employe => (
                        <option key={employe._id} value={employe._id}>
                          {employe.prenom} {employe.nom} - {employe.poste || "Sans poste"} 
                          ({employe.departement_id?.nom || "Non affecté"})
                        </option>
                      ))}
                    </select>
                    <span>Employé * ({employes.length} disponible(s))</span>
                    {employes.length === 0 && !loading && (
                      <div className="warning" style={{ fontSize: '12px', color: 'orange' }}>
                        Aucun employé actif disponible
                      </div>
                    )}
                  </div>
                )}

                {/* Champ département */}
                {form.assignationType === 'departement' && (
                  <div className="inpustBox">
                    <select 
                      value={form.departement_id} 
                      onChange={e => setForm({ ...form, departement_id: e.target.value })}
                      required
                      disabled={loading}
                    >
                      <option value="">Sélectionner un département</option>
                      {departements.map(dep => (
                        <option key={dep._id} value={dep._id}>
                          {dep.nom}
                        </option>
                      ))}
                    </select>
                    <span>Département *</span>
                  </div>
                )}
              </div>
            </div>
          </div>
  
          <div className="bsuttons">
            <button type="submit" className="btn-gslow" disabled={loading}>
              {loading ? "Traitement en cours..." : (id ? "Modifier" : "Créer")} la tâche
            </button>
            <button 
              type="button" 
              className="btn-cancsel" 
              onClick={() => navigate("/admin/taches")}
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </form>
  
        {showModal && (
          <div className="modal-overslcsay">
            <div className="mossdal">
              <h3>{modalMessage}</h3>
              <div className="msodsal-buttons">
                <button
                  onClick={() => {
                    setShowModal(false);
                    if (modalMessage.includes("succès")) {
                      navigate("/admin/taches");
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

export default FormTache;