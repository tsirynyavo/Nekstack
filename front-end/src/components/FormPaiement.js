import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../components/FormPaiement.css";


const FormPaiement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);

  // États du formulaire
  const [formData, setFormData] = useState({
    employeId: "",
    mois: "",
    dateDu: "",
    dateAu: "",
   datePaiement: "",
    primesImposables: [],
    primesNonImposables: [],
    deductions: [],
    statut: "validé"
  });

  const [employeInfo, setEmployeInfo] = useState({
    nom: "",
    prenom: "",
    matricule: "",
    salaireBase: 0,
    nombreEnfants: 0 ,
    contrat: "", // ← AJOUTER le vrai type de contrat
    dateFinContrat: "" // ← AJOUTER CE CHAMP MANQUANT
  });
  
  const [calculs, setCalculs] = useState({
    irsa: 0,
    salaireNet: 0,
    cotisationCIMR: 0,
    cotisationMaladie: 0,
    cotisationRetraite: 0,
    totalPrimesImposables: 0,
    totalPrimesNonImposables: 0,
    totalDeductions: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [taux, setTaux] = useState(null);
  const [showSimulation, setShowSimulation] = useState(false);
   
  const [tauxList, setTauxList] = useState([]); // Nouvel état pour la liste des taux
  const [selectedTauxId, setSelectedTauxId] = useState(""); // ID du taux sélectionné

  
  // Charger TOUS les taux
  useEffect(() => {
    const fetchTaux = async () => {
      try {
        const res = await axios.get("http://localhost:5050/taux");
        setTauxList(res.data || []);
        
        // Sélectionner le premier taux par défaut
        if (res.data.length > 0) {
          setTaux(res.data[0]);
          setSelectedTauxId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Erreur chargement des taux:", err);
      }
    };
    fetchTaux();
  }, []);

  // Mettre à jour le taux sélectionné
  const handleTauxChange = (tauxId) => {
    const selectedTaux = tauxList.find(t => t._id === tauxId);
    if (selectedTaux) {
      setTaux(selectedTaux);
      setSelectedTauxId(tauxId);
    }
  };useEffect(() => {
  const fetchEmployeDirect = async () => {
    if (location.state?.employeId && !isEdit) {
      try {
        console.log("🔄 Récupération depuis paimenteemploye...");
        
        // ⭐⭐ CORRECTION: Maintenant l'API retourne { employes: [], total, page, pages }
        const res = await axios.get("http://localhost:5050/paimenteemploye", {
          params: {
            page: 1,
            limit: 100 // Récupérer beaucoup d'employés pour trouver le bon
          }
        });
        
        // ⭐⭐ CORRECTION: Accéder à res.data.employes au lieu de res.data
        const employesList = res.data.employes || [];
        
        const employeData = employesList.find(emp => emp._id === location.state.employeId);
        
        if (employeData) {
          console.log("✅ Données employé trouvées:", employeData);
          console.log("📅 Date fin contrat:", employeData.dateFinContrat);
          console.log("📝 Contrat type:", employeData.contrat);
          console.log("💰 Salaire base:", employeData.salaireBase);

          setEmployeInfo({
            nom: employeData.nom || "",
            prenom: employeData.prenom || "",
            salaireBase: employeData.salaireBase || 0,
            nombreEnfants: employeData.nombreEnfants || 0,
            contrat: employeData.contrat || "",
            dateFinContrat: employeData.dateFinContrat || ""
          });

          setFormData(prev => ({
            ...prev,
            employeId: location.state.employeId,
            mois: location.state.moisSuggestion || ""
          }));

        } else {
          console.error("❌ Employé non trouvé dans la liste paginée");
          
          // ⭐⭐ SOLUTION DE SECOURS: Récupérer l'employé spécifique
          try {
            console.log("🔄 Tentative de récupération directe de l'employé...");
            const empRes = await axios.get(`http://localhost:5050/employes/${location.state.employeId}`);
            const employeDirect = empRes.data;
            
            console.log("✅ Données employé direct:", employeDirect);
            
            setEmployeInfo({
              nom: employeDirect.nom || "",
              prenom: employeDirect.prenom || "",
              salaireBase: employeDirect.salaire ? parseFloat(employeDirect.salaire.toString()) || 0 : 0,
              nombreEnfants: employeDirect.nombreEnfants || 0,
              contrat: employeDirect.contrat || "",
              dateFinContrat: employeDirect.dateFinContrat || ""
            });

            setFormData(prev => ({
              ...prev,
              employeId: location.state.employeId,
              mois: location.state.moisSuggestion || ""
            }));
            
          } catch (fallbackError) {
            console.error("❌ Erreur récupération directe:", fallbackError);
          }
        }

      } catch (err) {
        console.error("❌ Erreur récupération paginée:", err);
      }
    }
  };

  fetchEmployeDirect();
}, [location.state, isEdit]);

  // Met automatiquement les dates du mois précédent selon le mois choisi
useEffect(() => {
  if (formData.mois) {
    const [year, month] = formData.mois.split("-");

    const previousMonth = month - 1 === 0 ? 12 : month - 1;
    const previousYear = month - 1 === 0 ? year - 1 : year;

    const firstDay = new Date(previousYear, previousMonth - 1, 1);
    const lastDay = new Date(previousYear, previousMonth, 0);

    const formatDate = (d) => d.toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      dateDu: formatDate(firstDay),
      dateAu: formatDate(lastDay),
    }));

    // ⬇️⬇️⬇️ METTEZ VOTRE CODE ICI ⬇️⬇️⬇️
    // VÉRIFICATION SI LA DATE DE FIN DÉPASSE LE CDD
   // VÉRIFICATION SI LA DATE DE FIN DÉPASSE LE CDD
if (employeInfo.contrat === 'CDD' && employeInfo.dateFinContrat) {
  const dateFinContrat = new Date(employeInfo.dateFinContrat);
  const dateAu = new Date(lastDay);
  
  console.log("🔍 Vérification dates CDD:", {
    contrat: employeInfo.contrat,
    dateFinContrat: dateFinContrat.toLocaleDateString('fr-FR'),
    dateAu: dateAu.toLocaleDateString('fr-FR'),
    depasse: dateAu > dateFinContrat
  });
  
  if (dateAu > dateFinContrat) {
    setError(`⚠️ Attention: La période de paiement (jusqu'au ${dateAu.toLocaleDateString('fr-FR')}) dépasse la date de fin de CDD (${dateFinContrat.toLocaleDateString('fr-FR')})`);
  } else {
    setError(""); // Effacer l'erreur si tout est correct
  }
}

  }
}, [formData.mois, employeInfo.dateFinContrat, employeInfo.contrat]); // ⚠️ Ajouter employeInfo.contrat aux dépendances
// 🔄 CHARGEMENT DES DONNÉES POUR LA MODIFICATION
useEffect(() => {
  const fetchPaiementForEdit = async () => {
    if (isEdit && id && tauxList.length > 0) { // ⚠️ Ajout: tauxList.length > 0
      try {
        console.log("🔄 Chargement du paiement pour modification, ID:", id);
        
        const res = await axios.get(`http://localhost:5050/paiements/${id}`);
        const paiementData = res.data;
        
        console.log("✅ Données du paiement chargées:", paiementData);

        // Mettre à jour les informations employé
        if (paiementData.employe) {
          setEmployeInfo({
            nom: paiementData.employe.nom || "",
            prenom: paiementData.employe.prenom || "",
            salaireBase: paiementData.employe.salaireBase || 0,
            nombreEnfants: paiementData.employe.nombreEnfants || 0,
              contrat: paiementData.employe.contrat || "" , // ← AJOUT
               dateFinContrat: paiementData.employe.dateFinContrat || "" // ← AJOUT
          });
        }

        // CORRECTION : Charger le taux utilisé pour ce paiement
        if (paiementData.tauxId && tauxList.length > 0) {
          setSelectedTauxId(paiementData.tauxId);
          const tauxUtilise = tauxList.find(t => t._id === paiementData.tauxId);
          if (tauxUtilise) {
            setTaux(tauxUtilise);
          } else {
            // Fallback: utiliser le premier taux
            setSelectedTauxId(tauxList[0]._id);
            setTaux(tauxList[0]);
          }
        } else if (tauxList.length > 0) {
          // Aucun tauxId sauvegardé, utiliser le premier
          setSelectedTauxId(tauxList[0]._id);
          setTaux(tauxList[0]);
        }

        // Mettre à jour formData avec les données du paiement
        setFormData({
          employeId: paiementData.employe?._id || paiementData.employe || "",
          mois: paiementData.mois || "",
          dateDu: paiementData.dateDu || "",
          dateAu: paiementData.dateAu || "",
           datePaiement: paiementData.datePaiement || new Date().toISOString().split("T")[0], // ⭐⭐ AJOUT ICI
          statut: paiementData.statut || "validé",
          primesImposables: paiementData.primesImposables?.map(p => ({
            libelle: p.designation || "",
            montant: p.montant || 0
          })) || [],
          primesNonImposables: paiementData.primesNonImposables?.map(p => ({
            libelle: p.designation || "",
            montant: p.montant || 0
          })) || [],
          deductions: paiementData.deductions?.map(d => ({
            libelle: d.designation || "",
            montant: d.montant || 0
          })) || []
        });

        // Mettre à jour les calculs si les données existent
        if (paiementData.irsa !== undefined) {
          setCalculs({
            irsa: paiementData.irsa || 0,
            salaireNet: paiementData.salaireNet || 0,
            cotisationCIMR: paiementData.cotisationCIMR || 0,
            cotisationMaladie: paiementData.cotisationMaladie || 0,
            cotisationRetraite: paiementData.cotisationRetraite || 0,
            totalPrimesImposables: paiementData.totalPrimesImposables || 0,
            totalPrimesNonImposables: paiementData.totalPrimesNonImposables || 0,
            totalDeductions: paiementData.totalDeductions || 0
          });
        }

      } catch (err) {
        console.error("❌ Erreur chargement paiement:", err);
        setError("Erreur lors du chargement du paiement: " + (err.response?.data?.error || err.message));
      }
    }
  };

  fetchPaiementForEdit();
}, [isEdit, id, tauxList]); // ⚠️ Ajout: tauxList dans les dépendances

  // Calcul automatique quand les données changent
  useEffect(() => {
    if (formData.employeId && employeInfo.salaireBase && taux) {
      calculerPaiement();
    }
  }, [formData, employeInfo, taux]);

  // Fonction de simulation
  const handleSimuler = () => {
    calculerPaiement();
    setShowSimulation(true);
  };

  // Calculer le paiement
  const calculerPaiement = () => {
    const salaireBase = parseFloat(employeInfo.salaireBase) || 0;
    
    // Totaux des primes et déductions
    const totalPrimesImposables = formData.primesImposables.reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0);
    const totalPrimesNonImposables = formData.primesNonImposables.reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0);
    const totalDeductions = formData.deductions.reduce((sum, d) => sum + (parseFloat(d.montant) || 0), 0);

    // Cotisations
    const tauxCIMR = parseFloat(taux.tauxAR) || 0;
    const tauxMaladie = parseFloat(taux.tauxMaladie) || 0;
    const tauxRetraite = parseFloat(taux.retraiteComp) || 0;

    const cotisationCIMR = salaireBase * (tauxCIMR / 100);
    const cotisationMaladie = salaireBase * (tauxMaladie / 100);
    const cotisationRetraite = salaireBase * (tauxRetraite / 100);

    // Revenu imposable
    const revenuImposable = salaireBase + totalPrimesImposables;

    // IRSA (utilisant la même fonction que le back-end)
    const irsa = calculerIRSA(revenuImposable, employeInfo.nombreEnfants);

    // Salaire net
    const salaireNet = revenuImposable
      - cotisationCIMR
      - cotisationMaladie
      - cotisationRetraite
      - irsa
      + totalPrimesNonImposables
      - totalDeductions;

    setCalculs({
      irsa,
      salaireNet,
      cotisationCIMR,
      cotisationMaladie,
      cotisationRetraite,
      totalPrimesImposables,
      totalPrimesNonImposables,
      totalDeductions
    });
  };

  // Fonction de calcul IRSA (identique au back-end)
  const calculerIRSA = (revenuImposable, nombreEnfants) => {
    const bareme = [
      { limite: 350000, taux: 0.00 },
      { limite: 400000, taux: 0.05 },
      { limite: 500000, taux: 0.10 },
      { limite: 600000, taux: 0.15 },
      { limite: Infinity, taux: 0.20 }
    ];

    const MINIMUM_PERCEPTION = 3000;
    const DEDUCTION_PAR_ENFANT = 2000;

    let irsa = 0;
    let revenuRestant = revenuImposable;
    let limitePrecedente = 0;

    for (const tranche of bareme) {
      if (revenuRestant <= 0) break;
      const montantTranche = Math.min(revenuRestant, tranche.limite - limitePrecedente);
      irsa += montantTranche * tranche.taux;
      limitePrecedente = tranche.limite;
      revenuRestant -= montantTranche;
    }

    const deductionTotale = nombreEnfants * DEDUCTION_PAR_ENFANT;
    let irsaApresDeduction = Math.max(0, irsa - deductionTotale);

    const irsaFinal = Math.max(irsaApresDeduction, MINIMUM_PERCEPTION);

    return irsaFinal;
  };

  // Gestion des changements de formulaire
  const handleSimpleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  useEffect(() => {
  // Seulement pour la création (non édition) et si datePaiement est vide
  if (!isEdit && !formData.datePaiement) {
    const today = new Date().toISOString().split("T")[0];
    console.log("🔄 Initialisation datePaiement:", today);
    setFormData(prev => ({ 
      ...prev, 
      datePaiement: today 
    }));
  }
}, [isEdit, formData.datePaiement]); // Dépendances importantes


  // Met automatiquement les dates du mois précédent selon le mois choisi
  // Met automatiquement les dates du mois précédent selon le mois choisi
useEffect(() => {
  if (formData.mois) {
    const [year, month] = formData.mois.split("-");

    const previousMonth = month - 1 === 0 ? 12 : month - 1;
    const previousYear = month - 1 === 0 ? year - 1 : year;

    const firstDay = new Date(previousYear, previousMonth - 1, 1);
    const lastDay = new Date(previousYear, previousMonth, 0);

    const formatDate = (d) => d.toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      dateDu: formatDate(firstDay),
      dateAu: formatDate(lastDay),
    }));

    // VÉRIFICATION SI LA DATE DE FIN DÉPASSE LE CDD
    if (employeInfo.dateFinContrat) {
      const dateFinContrat = new Date(employeInfo.dateFinContrat);
      const dateAu = new Date(lastDay);
      
      console.log("🔍 Vérification dates:", {
        dateFinContrat: dateFinContrat.toLocaleDateString('fr-FR'),
        dateAu: dateAu.toLocaleDateString('fr-FR'),
        depasse: dateAu > dateFinContrat
      });
      
      if (dateAu > dateFinContrat) {
        setError(`⚠️ Attention: La période de paiement (jusqu'au ${dateAu.toLocaleDateString('fr-FR')}) dépasse la date de fin de CDD (${dateFinContrat.toLocaleDateString('fr-FR')})`);
      } else {
        setError(""); // Effacer l'erreur si tout est correct
      }
    }
  }
}, [formData.mois, employeInfo.dateFinContrat]);

  const handleArrayChange = (field, index, key, value) => {
    const newArray = [...formData[field]];
    newArray[index] = { ...newArray[index], [key]: value };
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], { libelle: "", montant: 0 }]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.employeId || formData.employeId === "") {
      setError("Erreur: ID employé manquant. Veuillez réessayer.");
      setLoading(false);
      return;
    }
     if (employeInfo.contrat === 'CDD' && employeInfo.dateFinContrat && formData.dateAu) {
    const dateFinContrat = new Date(employeInfo.dateFinContrat);
    const dateAu = new Date(formData.dateAu);
    
    if (dateAu > dateFinContrat) {
      setError(`❌ Impossible de créer le paiement: La période (jusqu'au ${dateAu.toLocaleDateString('fr-FR')}) dépasse la date de fin de CDD (${dateFinContrat.toLocaleDateString('fr-FR')})`);
      setLoading(false);
      return;
    }
  }

    const donneesAEnvoyer = {
      ...formData,
      datePaiement: formData.datePaiement,
      tauxId: selectedTauxId, // NOUVEAU : Sauvegarder l'ID du taux
      primesImposables: formData.primesImposables.map(p => ({
        designation: p.libelle || "", // CORRECTION: p.libelle au lieu de d.designation
        montant: p.montant || 0
      })),
      primesNonImposables: formData.primesNonImposables.map(p => ({
        designation: p.libelle || "",
        montant: p.montant || 0
      })),
      deductions: formData.deductions.map(d => ({
        designation: d.libelle || "",
        montant: d.montant || 0
      })),
      totalPrimesImposables: calculs.totalPrimesImposables || 0,
      totalPrimesNonImposables: calculs.totalPrimesNonImposables || 0,
      totalDeductions: calculs.totalDeductions || 0,
      irsa: calculs.irsa || 0,
      salaireNet: calculs.salaireNet || 0,
      employeNom: employeInfo.nom,
      employePrenom: employeInfo.prenom,
      salaireBase: employeInfo.salaireBase,
      nombreEnfants: employeInfo.nombreEnfants,
        dateFinContrat: employeInfo.dateFinContrat, // ← AJOUT
        statut: formData.statut,
      tauxCIMR: taux?.tauxAR || 0,
      tauxMaladie: taux?.tauxMaladie || 0,
      tauxRetraiteComp: taux?.retraiteComp || 0
    };

    console.log("📤 Données envoyées au serveur:", donneesAEnvoyer);

    try {
      if (isEdit) {
        await axios.put(`http://localhost:5050/paiements/${id}`, donneesAEnvoyer);
      } else {
        await axios.post("http://localhost:5050/paiements", donneesAEnvoyer);
      }
      
      navigate("/admin/paiements");
    } catch (err) {
      console.error("❌ Erreur soumission:", err);
      setError("Erreur: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir le détail des tranches IRSA
  const getDetailsTranchesIRSA = (revenuImposable) => {
    const bareme = [
      { limite: 350000, taux: 0.00 },
      { limite: 400000, taux: 0.05 },
      { limite: 500000, taux: 0.10 },
      { limite: 600000, taux: 0.15 },
      { limite: Infinity, taux: 0.20 }
    ];

    let details = [];
    let revenuRestant = revenuImposable;
    let limitePrecedente = 0;

    for (const tranche of bareme) {
      if (revenuRestant <= 0) break;
      
      const montantTranche = Math.min(revenuRestant, tranche.limite - limitePrecedente);
      const impotTranche = montantTranche * tranche.taux;
      
      if (montantTranche > 0) {
        details.push({
          montant: montantTranche,
          taux: tranche.taux,
          impot: impotTranche
        });
      }
      
      limitePrecedente = tranche.limite;
      revenuRestant -= montantTranche;
    }

    return details;
  };
// Fonction pour formater le montant en lettres (comme dans l'image)
const formatMontantEnLettres = (montant) => {
  return `${montant.toLocaleString()} dirhams`;
};

// ⭐⭐ NOUVELLE FONCTION : Formater la date pour l'input
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  
  try {
    // Si c'est déjà au bon format (YYYY-MM-DD), retourner tel quel
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Convertir en Date et formater en YYYY-MM-DD
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("❌ Date invalide:", dateString);
      return "";
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("❌ Erreur formatage date:", error, "Date:", dateString);
    return "";
  }
};
  return (
    <div className="form-paiccement-container">
      <div className="form-cc">
        <h2>{isEdit ? "Modifier" : "Créer"} un paiement</h2>
        <button onClick={() => navigate("/admin/paiements")} className="btnc-back">
          ← Retour
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-lcayout">
        <form onSubmit={handleSubmit} className="forccm-section">
          {/* Informations employé */}
          <div className="info-cemploye">
            <h3>Informations employé</h3>
            <div className="infoc-grid">
              <div><strong>Nom:</strong> {employeInfo.nom}</div>
              <div><strong>Prénom:</strong> {employeInfo.prenom}</div>
              <div><strong>Salaire de base:</strong> 
                {(!isNaN(employeInfo.salaireBase) && employeInfo.salaireBase !== null) 
                  ? `${employeInfo.salaireBase.toLocaleString()} MGA`
                  : '0 MGA'
                }
              </div>
             <div><strong>Enfants à charge:</strong> {employeInfo.nombreEnfants}</div>
     
    {/* AFFICHER TOUJOURS LE TYPE DE CONTRAT */}
    <div style={{
      color: employeInfo.contrat === 'CDD' ? '#e74c3c' : '#27ae60', 
      fontWeight: 'bold',
      border: '2px solid currentColor',
      padding: '8px',
      borderRadius: '4px'
    }}>
      <strong>Type de contrat:</strong> {employeInfo.contrat || 'Non spécifié'}
    </div>
    
    {/* AFFICHER LA DATE FIN SEULEMENT POUR CDD */}
    {employeInfo.contrat === 'CDD' && employeInfo.dateFinContrat && (
      <div style={{
        color: '#e74c3c', 
        fontWeight: 'bold',
        border: '2px solid #e74c3c',
        padding: '8px',
        borderRadius: '4px',
        backgroundColor: '#fff5f5'
      }}>
        <strong>Date fin de contrat (CDD):</strong> {new Date(employeInfo.dateFinContrat).toLocaleDateString('fr-FR')}
      </div>
    )}
  </div>
</div>

  <div className="form-row-1">
  <div className="form-groucp">
    <label>Mois *</label>
    <input
      type="month"
      value={formData.mois}
      onChange={(e) => handleSimpleChange("mois", e.target.value)}
      required
    />
  {formData.dateDu && formData.dateAu && (
    <div className="dates-cdisplay-readable">
      Période de travail : du <strong>{new Date(formData.dateDu).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
      &nbsp;au&nbsp;
      <strong>{new Date(formData.dateAu).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
      
      {/* AJOUT: Avertissement si période dépasse CDD */}
      {employeInfo.dateFinContrat && new Date(formData.dateAu) > new Date(employeInfo.dateFinContrat) && (
        <div style={{
          color: '#e74c3c', 
          marginTop: '5px', 
          fontSize: '0.9em',
          fontWeight: 'bold',
          padding: '5px',
          backgroundColor: '#fff5f5',
          border: '1px solid #e74c3c',
          borderRadius: '4px'
        }}>
          ⚠️ Cette période dépasse la date de fin de CDD
        </div>
      )}
    </div>
  )}
</div>
{/* NOUVEAU : Sélecteur de taux */}
<div className="form-groupc">
  <label>Taux de cotisation *</label>
  <select 
    value={selectedTauxId} 
    onChange={(e) => handleTauxChange(e.target.value)}
    className="taux-selecct"
    required
  >
    <option value="">Sélectionner un taux</option>
    {tauxList.map((tauxItem) => (
      <option key={tauxItem._id} value={tauxItem._id}>
        {tauxItem.nom || "Taux"} - Retraite: {tauxItem.tauxAR}% | Maladie: {tauxItem.tauxMaladie}% | Assurance Supplementaire: {tauxItem.retraiteComp}%
      </option>
    ))}
  </select>
  
  {/* Affichage des détails du taux sélectionné */}

</div>
</div>

  <div className="form-row-2">
  {/* Statut à gauche */}
  <div className="form-grcoup">
    <label>Statut du paiement *</label>
    <select 
      value={formData.statut || "validé"}
      onChange={(e) => handleSimpleChange("statut", e.target.value)}
      className="statuct-select"
      required
    >
      <option value="validé">Validé</option>
      <option value="payé">Payé</option>
    </select>
    <div className="statut-dectails">
      <small>
        <strong>Validé</strong> : Paiement calculé et approuvé | 
        <strong> Payé</strong> : Paiement effectué à l'employé
      </small>
    </div>
  </div>

  {/* Date paiement à droite */}
  <div className="forcm-group">
    <label>Date du paiement *</label>
    <input
      type="date"
      value={formatDateForInput(formData.datePaiement)}
      onChange={(e) => handleSimpleChange("datePaiement", e.target.value)}
      required
    />
   
  </div>
</div>
        {/* Sections primes et déductions - ALIGNEMENT HORIZONTAL */}
<div className="primes-sections-container">
  <ArrayFieldSection
    title="Primes imposables"
    field="primesImposables"
    items={formData.primesImposables}
    onArrayChange={handleArrayChange}
    onAddItem={addArrayItem}
    onRemoveItem={removeArrayItem}
    className="array-section primes-imposables"
  />

  <ArrayFieldSection
    title="Primes non imposables"
    field="primesNonImposables"
    items={formData.primesNonImposables}
    onArrayChange={handleArrayChange}
    onAddItem={addArrayItem}
    onRemoveItem={removeArrayItem}
    className="array-section primes-non-imposables"
  />

  <ArrayFieldSection
    title="Déductions"
    field="deductions"
    items={formData.deductions}
    onArrayChange={handleArrayChange}
    onAddItem={addArrayItem}
    onRemoveItem={removeArrayItem}
    className="array-section deductions"
  />
</div>

          <div className="form-bcuttons">
            <button type="button" onClick={handleSimuler} className="btn-scimuler">
              Simuler
            </button>
            <button type="submit" disabled={loading} className="btn-pricmary">
              {loading ? "Envoi..." : (isEdit ? "Modifier" : "Créer")} le paiement
            </button>
            <button 
              type="button" 
              onClick={() => navigate("/admin/paiements")} 
              className="btn-csecondary"
            >
              Annuler
            </button>
          </div>
        </form>

        {/* Simulation - Version complète avec tranches et annuel/mensuel */}
        {showSimulation && (
          <div className="simulation-seccction">
            <h3>Simulation du paiement</h3>
            
            {/* Tableau principal */}
           {/* Tableau détaillé avec calcul par tranches */}
            <div className="detailed-tabcle">
              <h4>Détail des calculs</h4>
              <table className="table-detcailed">
                <thead>
                  <tr>
                    <th>Rubriques</th>
                    <th>Nombre / taux</th>
                    <th>Base</th>
                    <th>A payer</th>
                    <th>A retenir</th>
                  </tr>
                </thead>
                <tbody>
                  {/* SALAIRE ET PRIMES */}
                  <tr>
                    <td>Salaire de base</td>
                    <td></td>
                    <td>{employeInfo.salaireBase?.toLocaleString()},00</td>
                    <td></td>
                    <td>{employeInfo.salaireBase?.toLocaleString()},00</td>
                  </tr>
                  
                  {formData.primesImposables.map((prime, index) => (
                    <tr key={`imposable-${index}`}>
                      <td>{prime.libelle || "Prime imposable"}</td>
                      <td></td>
                      <td>{prime.montant?.toLocaleString()},00</td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                  {formData.primesImposables.length > 0 && (
                    <tr>
                      <td><strong>Total primes imposables</strong></td>
                      <td></td>
                      <td><strong>{calculs.totalPrimesImposables?.toLocaleString()},00</strong></td>
                      <td></td>
                      <td></td>
                    </tr>
                  )}
                  
                  {formData.primesNonImposables.map((prime, index) => (
                    <tr key={`nonimposable-${index}`}>
                      <td>{prime.libelle || "Prime non imposable"}</td>
                      <td></td>
                      <td></td>
                      <td>{prime.montant?.toLocaleString()},00</td>
                      <td></td>
                    </tr>
                  ))}
                  {formData.primesNonImposables.length > 0 && (
                    <tr>
                      <td><strong>Total primes non imposables</strong></td>
                      <td></td>
                      <td></td>
                      <td><strong>{calculs.totalPrimesNonImposables?.toLocaleString()},00</strong></td>
                      <td></td>
                    </tr>
                  )}

                  <tr>
                    <td><strong>Salaire brut</strong></td>
                    <td></td>
                    <td><strong>{(employeInfo.salaireBase + calculs.totalPrimesImposables)?.toLocaleString()},00</strong></td>
                    <td><strong>{(employeInfo.salaireBase + calculs.totalPrimesImposables + calculs.totalPrimesNonImposables)?.toLocaleString()},00</strong></td>
                    <td></td>
                  </tr>

                  {/* COTISATIONS */}
                  <tr>
                    <td>Cotisation Retraite</td>
                    <td>{taux?.tauxAR}%</td>
                    <td>{employeInfo.salaireBase?.toLocaleString()},00</td>
                    <td></td>
                    <td>{calculs.cotisationCIMR?.toLocaleString()},00</td>
                  </tr>

                  <tr>
                    <td>Cotisation Maladie</td>
                    <td>{taux?.tauxMaladie}%</td>
                    <td>{employeInfo.salaireBase?.toLocaleString()},00</td>
                    <td></td>
                    <td>{calculs.cotisationMaladie?.toLocaleString()},00</td>
                  </tr>

                  <tr>
                    <td>Assurance Supplementaire</td>
                    <td>{taux?.retraiteComp}%</td>
                    <td>{employeInfo.salaireBase?.toLocaleString()},00</td>
                    <td></td>
                    <td>{calculs.cotisationRetraite?.toLocaleString()},00</td>
                  </tr>

                  <tr>
                    <td><strong>Total cotisations sociales</strong></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><strong>{(calculs.cotisationCIMR + calculs.cotisationMaladie + calculs.cotisationRetraite)?.toLocaleString()},00</strong></td>
                  </tr>

                  <tr>
                    <td><strong>Salaire net imposable</strong></td>
                    <td></td>
                    <td><strong>{(employeInfo.salaireBase + calculs.totalPrimesImposables)?.toLocaleString()},00</strong></td>
                    <td></td>
                    <td></td>
                  </tr>

                  {/* CALCUL DÉTAILLÉ IRSA PAR TRANCHES */}
                  <tr>
                    <td colSpan="5" style={{background: '#595f65ff', color: 'white', fontWeight: 'bold', padding: '10px'}}>
                      Calcul IRSA par tranches:
                    </td>
                  </tr>
                  
                  {getDetailsTranchesIRSA(employeInfo.salaireBase + calculs.totalPrimesImposables).map((tranche, index) => (
                    <tr key={`tranche-${index}`}>
                      <td style={{paddingLeft: '20px'}}>Tranche {index + 1}</td>
                      <td>{(tranche.taux * 100).toFixed(0)}%</td>
                      <td>{tranche.montant?.toLocaleString()},00</td>
                      <td></td>
                      <td>{tranche.impot?.toLocaleString()},00</td>
                    </tr>
                  ))}
                  
                  <tr>
                    <td style={{paddingLeft: '20px'}}><strong>Sous-total IRSA</strong></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><strong>{calculerIRSA(employeInfo.salaireBase + calculs.totalPrimesImposables, 0)?.toLocaleString()},00</strong></td>
                  </tr>

                  <tr>
                    <td style={{paddingLeft: '20px'}}>Déduction enfants ({employeInfo.nombreEnfants} × 2,000)</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>- {(employeInfo.nombreEnfants * 2000)?.toLocaleString()},00</td>
                  </tr>

                  <tr>
                    <td style={{paddingLeft: '20px'}}><strong>IRSA final</strong></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><strong>{calculs.irsa?.toLocaleString()},00</strong></td>
                  </tr>

                  {/* DÉDUCTIONS SUPPLÉMENTAIRES */}
                  {formData.deductions.map((deduction, index) => (
                    <tr key={`deduction-${index}`}>
                      <td>{deduction.libelle || "Déduction"}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>- {deduction.montant?.toLocaleString()},00</td>
                    </tr>
                  ))}

                  {/* TOTAL GÉNÉRAL */}
                  <tr>
                    <td colSpan="5" style={{background: '#595f65ff', color: 'white', fontWeight: 'bold', padding: '10px'}}>
                      TOTAL GÉNÉRAL
                    </td>
                  </tr>
                  
                  <tr>
                    <td><strong>Total à payer</strong></td>
                    <td></td>
                    <td></td>
                    <td><strong>{(employeInfo.salaireBase + calculs.totalPrimesImposables + calculs.totalPrimesNonImposables)?.toLocaleString()},00</strong></td>
                    <td></td>
                  </tr>

                  <tr>
                    <td><strong>Total à retenir</strong></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><strong>{(calculs.cotisationCIMR + calculs.cotisationMaladie + calculs.cotisationRetraite + calculs.irsa + calculs.totalDeductions)?.toLocaleString()},00</strong></td>
                  </tr>

                  <tr>
                    <td><strong>NET À PAYER</strong></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><strong style={{fontSize: '1.1em', color: '#27ae60'}}>{calculs.salaireNet?.toLocaleString()},00</strong></td>
                  </tr>
                </tbody>
              </table>
              
              {/* Tableau récapitulatif mensuel/annuel */}
              <table className="table-recacp">
                <thead>
                  <tr>
                    <th></th>
                    <th>Brut imposable</th>
                    <th>Net imposable</th>
                    <th>Retenue I.R.</th>
                    <th>Net à payer</th>
               
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Mensuel</strong></td>
                    <td>{(employeInfo.salaireBase + calculs.totalPrimesImposables)?.toLocaleString()},00</td>
                    <td>{(employeInfo.salaireBase + calculs.totalPrimesImposables)?.toLocaleString()},00</td>
                    <td>{calculs.irsa?.toLocaleString()},00</td>
                    <td>{calculs.salaireNet?.toLocaleString()},00</td>
                    
                  </tr>
                  
                  {/* SIGNATURE */}
                
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pour les champs de tableau
const ArrayFieldSection = ({ title, field, items, onArrayChange, onAddItem, onRemoveItem }) => {
  return (
    <div className="array-field-csection">
      <div className="section-heacder">
        <h4>{title}</h4>
        <button type="button" onClick={() => onAddItem(field)} className="btn-acdd">
          + Ajouter
        </button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="arcray-item">
          <input
            type="text"
            placeholder="Libellé"
            value={item.libelle || ""}
            onChange={(e) => onArrayChange(field, index, "libelle", e.target.value)}
          />
          <input
            type="number"
            placeholder="Montant"
            value={item.montant || ""}
            onChange={(e) => onArrayChange(field, index, "montant", parseFloat(e.target.value) || 0)}
            min="0"
            step="100"
          />
          <button 
            type="button" 
            onClick={() => onRemoveItem(field, index)}
            className="btn-remcove"
          >
            ×
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <div className="no-iccctems">Aucun élément</div>
      )}
    </div>
  );
};

export default FormPaiement;