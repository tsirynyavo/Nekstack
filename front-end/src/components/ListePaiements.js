import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../components/ListePaiements.css" ;
import PaiementMvola from "../components/PaiementMvola.js"; // ⬅️ AJOUTE CETTE LIGNE
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
const ListePaiements = () => {
  const navigate = useNavigate();
  const [employes, setEmployes] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [showHistorique, setShowHistorique] = useState(false);
   const [statutFilter, setStatutFilter] = useState("actif");
   const [dateDebut, setDateDebut] = useState("");
const [dateFin, setDateFin] = useState("");
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [paiementToDelete, setPaiementToDelete] = useState(null);

  
  // AJOUT : États pour la modal de détails
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
   const [showMvola, setShowMvola] = useState(false);
  const [selectedEmployeMvola, setSelectedEmployeMvola] = useState(null);
   const [departementFilter, setDepartementFilter] = useState("");
  const [departements, setDepartements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployes, setTotalEmployes] = useState(0);
  const fetchData = async () => {
  try {
    setLoading(true);
    
    // ⭐ CORRECTION: Paramètres SEPARÉS pour chaque endpoint
    const employesParams = {
      search: search,
      statut: statutFilter,
      departement: departementFilter,
      page: currentPage,
      limit: 5, // 5 employés par page
      dateDebut: dateDebut || undefined,
      dateFin: dateFin || undefined
    };

    const paiementsParams = {
      // ⭐ IMPORTANT: Pour les paiements, on veut TOUS les paiements pour les employés affichés
      search: search,
      departement: departementFilter,
      page: 1, // ⭐ TOUJOURS page 1 pour les paiements
      limit: 100, // ⭐ Limite élevée pour avoir tous les paiements nécessaires
      dateDebut: dateDebut || undefined,
      dateFin: dateFin || undefined
    };

    const [empRes, paiementsRes, depRes] = await Promise.all([
      axios.get("http://localhost:5050/paimenteemploye", { params: employesParams }),
      axios.get("http://localhost:5050/paiements", { params: paiementsParams }),
      axios.get("http://localhost:5050/departements")
    ]);
    
    setEmployes(empRes.data.employes || []);
    setTotalPages(empRes.data.pages || 1);
    setTotalEmployes(empRes.data.total || 0);
    
    // ⭐ CORRECTION: Toujours prendre tous les paiements (pas de pagination pour les paiements)
    setPaiements(paiementsRes.data.paiements || []);
    setDepartements(depRes.data || []);
    
  } catch (err) {
    setError("Erreur lors du chargement des données");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

// ⭐ AJOUT: useEffect pour charger les données quand currentPage change
useEffect(() => {
  fetchData();
}, [currentPage]);

useEffect(() => {
  setCurrentPage(1);
}, [search, statutFilter, departementFilter, dateDebut, dateFin]);


// ⭐ AJOUT: useEffect pour charger les données quand les filtres changent (sans currentPage)
useEffect(() => {
  if (currentPage === 1) {
    fetchData();
  }
  // Si currentPage n'est pas 1, le premier useEffect va le remettre à 1 et déclencher le rechargement
}, [search, statutFilter, departementFilter, dateDebut, dateFin]);

  const getDernierPaiementParEmploye = () => {
    const paiementsParEmploye = {};
    
    paiements.forEach(paiement => {
      const employeId = paiement.employe._id;
      if (!paiementsParEmploye[employeId] || 
          new Date(paiement.mois) > new Date(paiementsParEmploye[employeId].mois)) {
        paiementsParEmploye[employeId] = paiement;
      }
    });
    
    return paiementsParEmploye;
  };
  
  const handleResetFilters = async () => {
  setSearch("");
  setDateDebut("");
  setDateFin("");
  setStatutFilter("actif");
  setDepartementFilter("");
  setCurrentPage(1);
  // Le useEffect s'occupera de recharger les données automatiquement
  try {
    setLoading(true);
    const [empRes, paiementsRes] = await Promise.all([
      axios.get("http://localhost:5050/paimenteemploye", { 
        params: { 
          statut: "actif",
          page: 1, // ⭐ AJOUT
          limit: 5 // ⭐ AJOUT
        } 
      }),
      axios.get("http://localhost:5050/paiements", {
        params: {
          page: 1, // ⭐ AJOUT
          limit: 5 // ⭐ AJOUT
        }
      })
    ]);

    // ⭐ MODIFICATION: Gérer la réponse paginée
    if (empRes.data.employes) {
      setEmployes(empRes.data.employes || []);
      setTotalPages(empRes.data.pages || 1);
      setTotalEmployes(empRes.data.total || 0);
    } else {
      setEmployes(empRes.data || []);
    }
    
    if (paiementsRes.data.paiements) {
      setPaiements(paiementsRes.data.paiements || []);
    } else {
      setPaiements(paiementsRes.data || []);
    }
    
  } catch (err) {
    setError("Erreur lors de la réinitialisation des filtres");
  } finally {
    setLoading(false);
  }
};
  // Filtrer les employés selon la recherche
  const filteredEmployes = employes.filter(emp => 
    emp.matricule?.toLowerCase().includes(search.toLowerCase()) ||
    emp.nom?.toLowerCase().includes(search.toLowerCase()) ||
    emp.prenom?.toLowerCase().includes(search.toLowerCase())
  );

  // Obtenir les paiements d'un employé spécifique
  const getPaiementsEmploye = (employeId) => {
    return paiements
      .filter(p => p.employe._id === employeId)
      .sort((a, b) => new Date(b.mois) - new Date(a.mois));
  };
  // AJOUTER : Vérifier si c'est le dernier paiement
const isDernierPaiement = (paiement) => {
  if (!selectedEmploye) return false;
  const dernierPaiement = getDernierPaiementParEmploye()[selectedEmploye._id];
  return dernierPaiement && dernierPaiement._id === paiement._id;
};

  // Ouvrir l'historique d'un employé
  const openHistorique = (employe) => {
    setSelectedEmploye(employe);
    setShowHistorique(true);
  };
// AJOUT : Fonction pour ouvrir les détails d'un paiement
const openDetails = (paiement) => {
  setSelectedPaiement(paiement);
  setShowDetails(true);
};

// AJOUT : Fonction pour fermer les détails
const closeDetails = () => {
  setShowDetails(false);
  setSelectedPaiement(null);
};
  // Dans la fonction navigateToCreate, corriger l'envoi des données :
// Dans la fonction navigateToCreate, corriger l'envoi des données :
// Remplacer la fonction navigateToCreate par :
const navigateToCreate = (employe) => {
  const dernierPaiement = getDernierPaiementParEmploye()[employe._id];
  let moisSuggestion = "";
  
  if (dernierPaiement) {
    const dernierMois = new Date(dernierPaiement.mois);
    dernierMois.setMonth(dernierMois.getMonth() + 1);
    moisSuggestion = dernierMois.toISOString().substring(0, 7);
  } else {
    moisSuggestion = new Date().toISOString().substring(0, 7);
  }

  // CORRECTION COMPLÈTE : Gestion robuste du salaire
  let salaireBase = 0;
  
  if (employe.salaire) {
    if (typeof employe.salaire === 'object' && employe.salaire.toString) {
      // Cas Decimal128 de MongoDB
      salaireBase = parseFloat(employe.salaire.toString());
    } else if (typeof employe.salaire === 'string') {
      // Cas string
      salaireBase = parseFloat(employe.salaire);
    } else if (typeof employe.salaire === 'number') {
      // Cas number direct
      salaireBase = employe.salaire;
    }
  }
  
  // Vérification finale
  if (isNaN(salaireBase) || !isFinite(salaireBase)) {
    salaireBase = 0;
  }

  console.log("🔍 DEBUG navigateToCreate:", {
    employeSalaire: employe.salaire,
    type: typeof employe.salaire,
    salaireBaseConverti: salaireBase
  });

  // Passer les données de pré-remplissage via state
  navigate("/admin/paiements/create", {
    state: {
      employeId: employe._id,
      employeNom: employe.nom,
      employePrenom: employe.prenom,
      salaireBase: salaireBase, // Number garanti
      nombreEnfants: employe.nombreEnfants || 0,
      moisSuggestion: moisSuggestion
    }
  });
};
// Fonction pour ouvrir le modal de suppression
const openDeleteModal = (paiement) => {
  setPaiementToDelete(paiement);
  setShowDeleteModal(true);
};

// Fonction pour fermer le modal de suppression
const closeDeleteModal = () => {
  setShowDeleteModal(false);
  setPaiementToDelete(null);
};

// Fonction pour confirmer la suppression
const confirmDelete = async () => {
  if (!paiementToDelete) return;
  
  try {
    await axios.delete(`http://localhost:5050/paiements/${paiementToDelete._id}`);
    fetchData();
    
    // Fermer les modals si nécessaire
    if (showHistorique) {
      const paiementsRestants = getPaiementsEmploye(selectedEmploye._id);
      if (paiementsRestants.length === 0) {
        setShowHistorique(false);
      }
    }
    
    closeDeleteModal();
  } catch (err) {
    setError("Erreur lors de la suppression: " + (err.response?.data?.error || err.message));
    closeDeleteModal();
  }
};
   
// Fonction pour formater les montants avec espaces
const formatMontant = (montant) => {
  if (!montant && montant !== 0) return '0';
  return parseFloat(montant).toLocaleString('fr-FR').replace(/,/g, ' ');
};
  // Naviguer vers la page de modification
  const navigateToEdit = (paiement) => {
    navigate(`/admin/paiements/edit/${paiement._id}`, {
      state: {
        paiementData: paiement
      }
    });
  };
// ⭐⭐ NOUVELLE FONCTION : Ouvrir paiement MVola
const ouvrirPaiementMvola = (employe) => {
  const dernierPaiement = getDernierPaiementParEmploye()[employe._id];
  if (!dernierPaiement) {
    alert("Veuillez d'abord créer une fiche de paie pour cet employé");
    return;
  }
  
  if (dernierPaiement.statut !== 'validé' && dernierPaiement.statut !== 'payé') {
    alert("Le paiement doit être validé avant d'être envoyé par MVola");
    return;
  }
  
  setSelectedEmployeMvola(employe);
  setShowMvola(true);
};
  // Supprimer un paiement
  const handleDeletePaiement = async (paiementId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce paiement ?")) return;
    
    try {
      await axios.delete(`http://localhost:5050/paiements/${paiementId}`);
      fetchData();
      if (showHistorique) {
        const paiementsRestants = getPaiementsEmploye(selectedEmploye._id);
        if (paiementsRestants.length === 0) {
          setShowHistorique(false);
        }
      }
    } catch (err) {
      setError("Erreur lors de la suppression: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="gestion-paiements-container">
        <div className="loading">Chargement des données...</div>
      </div>
    );
  }const imprimerDernierPaiement = (employe) => {
  const dernierPaiement = getDernierPaiementParEmploye()[employe._id];
  if (!dernierPaiement) {
    alert("Aucun paiement à imprimer pour cet employé");
    return;
  }

  // ⭐⭐ CORRECTION : CALCULER LES COTISATIONS
  const salaireBase = dernierPaiement.salaireBase || 0;
  const tauxCIMR = dernierPaiement.tauxCIMR || 0;
  const tauxMaladie = dernierPaiement.tauxMaladie || 0;
  const tauxRetraite = dernierPaiement.tauxRetraiteComp || 0;

  const cotisationCIMR = (salaireBase * tauxCIMR) / 100;
  const cotisationMaladie = (salaireBase * tauxMaladie) / 100;
  const cotisationRetraite = (salaireBase * tauxRetraite) / 100;
  const totalCotisations = cotisationCIMR + cotisationMaladie + cotisationRetraite;

  // Formater la date de paiement
  const datePaiementFormatee = dernierPaiement.datePaiement 
    ? new Date(dernierPaiement.datePaiement).toLocaleDateString('fr-FR')
    : 'Non définie';

  // Créer le contenu HTML pour l'impression (avec les calculs corrigés)
  const content = `
<!DOCTYPE html>
<html>
<head>
    <title>Fiche de Paie</title>
    <style>
        /* VOTRE CSS EXISTANT */
        body { font-family: 'Times New Roman', Times, serif; margin: 10px; color: #000000; font-size: 11px; line-height: 1.1; }
        .header { text-align: center; border-bottom: 1px solid #000000; padding-bottom: 5px; margin-bottom: 8px; }
        .header h1 { font-size: 14px; font-weight: bold; margin: 0 0 3px 0; }
        .header h3 { font-size: 11px; font-weight: normal; margin: 2px 0; }
        .info-employe { margin-bottom: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 2px; font-size: 10px; }
        .info-paiement { margin-bottom: 8px; font-size: 10px; }
        .table-style { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 9px; }
        .table-style td, .table-style th { border: 1px solid #000000; padding: 4px 3px; text-align: left; }
        .table-style th { background-color: white; font-weight: bold; text-align: center; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { font-weight: bold; }
        .montant-lettres { margin: 8px 0; padding: 4px; border: 1px solid #000000; text-align: center; font-style: italic; font-weight: bold; font-size: 10px; }
        .signature { margin-top: 15px; text-align: right; font-size: 10px; }
        .net-a-payer { border-top: 2px solid #000000 !important; }
        .date-paiement-info { border: 1px solid #000000; padding: 2px 4px; margin: 4px 0; display: inline-block; font-size: 10px; }
        .rubrique-gras { font-weight: bold; color: #000000; }
        @media print { body { margin: 8px; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>BULLETIN DE PAIE</h1>
        <h3>Période : ${formatMois(dernierPaiement.mois)}</h3>
        <div class="date-paiement-info">
            <strong>Date de paiement : ${datePaiementFormatee}</strong>
        </div>
    </div>

    <div class="info-employe">
        <div><strong>Nom:</strong> ${employe.nom}</div>
        <div><strong>Prénom:</strong> ${employe.prenom}</div>
        <div><strong>Matricule:</strong> ${employe.matricule}</div>
        <div><strong>Enfants:</strong> ${employe.nombreEnfants || 0}</div>
    </div>

    <div class="info-paiement">
        <div><strong>Statut:</strong> ${dernierPaiement.statut === 'validé' ? 'Validé' : 'Payé'}</div>
        <div><strong>Émission:</strong> ${new Date().toLocaleDateString('fr-FR')}</div>
    </div>

    <table class="table-style">
        <thead>
            <tr>
                <th style="width: 40%;">Rubriques</th>
                <th style="width: 12%;">Taux</th>
                <th style="width: 16%;">Base</th>
                <th style="width: 16%;">À payer</th>
                <th style="width: 16%;">À retenir</th>
            </tr>
        </thead>
        <tbody>
            <!-- SALAIRE DE BASE -->
            <tr>
                <td class="rubrique-gras">Salaire de base</td>
                <td class="text-center">-</td>
                <td class="text-right">${formatMontant(salaireBase)}</td>
                <td class="text-center">-</td>
                <td class="text-right">${formatMontant(salaireBase)}</td>
            </tr>

            ${(dernierPaiement.primesImposables || []).map(prime => `
                <tr>
                    <td class="rubrique-gras">${prime.designation || 'Prime'}</td>
                    <td class="text-center">-</td>
                    <td class="text-right">${formatMontant(prime.montant)}</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                </tr>
            `).join('')}

            ${(dernierPaiement.primesImposables || []).length > 0 ? `
                <tr class="total-row">
                    <td class="rubrique-gras">Total primes imposables</td>
                    <td class="text-center">-</td>
                    <td class="text-right"><strong>${formatMontant(dernierPaiement.totalPrimesImposables || 0)}</strong></td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                </tr>
            ` : ''}

            ${(dernierPaiement.primesNonImposables || []).map(prime => `
                <tr>
                    <td class="rubrique-gras">${prime.designation || 'Prime non imp.'}</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-right">${formatMontant(prime.montant)}</td>
                    <td class="text-center">-</td>
                </tr>
            `).join('')}

            ${(dernierPaiement.primesNonImposables || []).length > 0 ? `
                <tr class="total-row">
                    <td class="rubrique-gras">Total primes non imp.</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-right"><strong>${formatMontant(dernierPaiement.totalPrimesNonImposables || 0)}</strong></td>
                    <td class="text-center">-</td>
                </tr>
            ` : ''}

            <!-- SALAIRE BRUT -->
            <tr class="total-row">
                <td class="rubrique-gras">SALAIRE BRUT</td>
                <td class="text-center">-</td>
                <td class="text-right"><strong>${formatMontant(salaireBase + (dernierPaiement.totalPrimesImposables || 0))}</strong></td>
                <td class="text-right"><strong>${formatMontant(salaireBase + (dernierPaiement.totalPrimesImposables || 0) + (dernierPaiement.totalPrimesNonImposables || 0))}</strong></td>
                <td class="text-center">-</td>
            </tr>

            <!-- ⭐⭐ CORRECTION : COTISATIONS AVEC CALCUL -->
            <tr>
                <td class="rubrique-gras">Cotisation Retraite</td>
                <td class="text-right">${tauxCIMR}%</td>
                <td class="text-right">${formatMontant(salaireBase)}</td>
                <td class="text-center">-</td>
                <td class="text-right">${formatMontant(cotisationCIMR)}</td>
            </tr>

            <tr>
                <td class="rubrique-gras">Cotisation Maladie</td>
                <td class="text-right">${tauxMaladie}%</td>
                <td class="text-right">${formatMontant(salaireBase)}</td>
                <td class="text-center">-</td>
                <td class="text-right">${formatMontant(cotisationMaladie)}</td>
            </tr>

            <tr>
                <td class="rubrique-gras">Assurance supplementaire</td>
                <td class="text-right">${tauxRetraite}%</td>
                <td class="text-right">${formatMontant(salaireBase)}</td>
                <td class="text-center">-</td>
                <td class="text-right">${formatMontant(cotisationRetraite)}</td>
            </tr>

            <!-- TOTAL COTISATIONS -->
            <tr class="total-row">
                <td class="rubrique-gras">TOTAL COTISATIONS SOCIALES</td>
                <td class="text-center">-</td>
                <td class="text-center">-</td>
                <td class="text-center">-</td>
                <td class="text-right"><strong>${formatMontant(totalCotisations)}</strong></td>
            </tr>

            <!-- IRSA -->
            <tr>
                <td class="rubrique-gras">Impôt (IRSA)</td>
                <td class="text-center">-</td>
                <td class="text-center">-</td>
                <td class="text-center">-</td>
                <td class="text-right">${formatMontant(dernierPaiement.irsa)}</td>
            </tr>

            <!-- DÉDUCTIONS -->
            ${(dernierPaiement.deductions || []).map(deduction => `
                <tr>
                    <td class="rubrique-gras">${deduction.designation || 'Déduction'}</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-right">- ${formatMontant(deduction.montant)}</td>
                </tr>
            `).join('')}

            ${(dernierPaiement.deductions || []).length > 0 ? `
                <tr class="total-row">
                    <td class="rubrique-gras">TOTAL DÉDUCTIONS</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-right"><strong>${formatMontant(dernierPaiement.totalDeductions || 0)}</strong></td>
                </tr>
            ` : ''}

            <!-- NET À PAYER -->
            <tr class="total-row net-a-payer">
                <td class="rubrique-gras">NET À PAYER</td>
                <td class="text-center">-</td>
                <td class="text-center">-</td>
                <td class="text-center">-</td>
                <td class="text-right"><strong>${formatMontant(dernierPaiement.salaireNet)} MGA</strong></td>
            </tr>
        </tbody>
    </table>

    <!-- MONTANT EN LETTRES -->
    <div class="montant-lettres">
        Net à payer : <strong>${formatMontant(dernierPaiement.salaireNet)} Ariary</strong>
    </div>

    <!-- SIGNATURE -->
    <div class="signature">
        <p>Fait à Ambalavao, le ${new Date().toLocaleDateString('fr-FR')}</p>
        <p>Le Responsable RH</p>
        <p>_________________________</p>
    </div>

    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>
  `;

  // Ouvrir une nouvelle fenêtre et imprimer
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(content);
  printWindow.document.close();
};
// Fonction pour formater le montant en lettres
const formatMontantEnLettres = (montant) => {
  return `${formatMontant(montant)} Ariary`;
};

  const dernierPaiementParEmploye = getDernierPaiementParEmploye();
// Fonction pour formater "2025-10" en "Octobre 2025"
const formatMois = (mois) => {
  if (!mois) return "—";
  const date = new Date(mois + "-01"); // On ajoute le jour pour créer une vraie date
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
};

  return (
 <div className="gestion-paiement">
  <div className="headerz">
    <h2>Gestion des Paiements</h2>
    
    {/* ⭐⭐ AJOUT: Conteneur des filtres */}
    <div className="filters-containerz">
      {/* Première ligne : Recherche, dates, boutons */}
      <div className="search-boxz">
        <input 
          type="text" 
          placeholder="Rechercher par matricule, nom ou prénom..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>
      
      <div className="filter-groupz">
        <label>De :</label>
        <input 
          type="date" 
          value={dateDebut} 
          onChange={(e) => setDateDebut(e.target.value)} 
        />
      </div>

      <div className="filter-groupz">
        <label>À :</label>
        <input 
          type="date" 
          value={dateFin} 
          onChange={(e) => setDateFin(e.target.value)} 
        />
      </div>

      <button onClick={fetchData}>
        Filtrer
      </button>
      
      <button onClick={handleResetFilters}>
        Réinitialiser
      </button>

      {/* Deuxième ligne : Département et Rapport */}
      <div className="filters-bottom-row">
        {/* Département */}
        <div className="filter-groupz">
          <label>Département : </label>
          <select 
            value={departementFilter} 
            onChange={(e) => setDepartementFilter(e.target.value)}
          >
            <option value="">Tous les départements</option>
            {departements.map(dep => (
              <option key={dep._id} value={dep._id}>
                {dep.nom}
              </option>
            ))}
          </select>
        </div>
        
        {/* Rapport poussé à droite */}
        <button 
          className="btn-rapportz"
          onClick={() => navigate("/admin/rapports/journal-paie")}
          title="Voir le rapport complet"
        >
          Voir le rapport
        </button>
      </div>
    </div>
  </div>

  {error && (
    <div className="error-messagez">
      {error}
      <button onClick={() => setError("")}>×</button>
    </div>
  )}
      {/* Tableau principal des employés */}
      <div className="table-containerz">
        <table className="paiements-tablez">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom</th>
             
              <th>Dernier mois payé</th>
              <th>Date paiement</th>
              <th>Salaire de base</th>
              <th>Enfants à charge</th>
               <th>Statut Paiement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployes.map(employe => {
              const dernierPaiement = dernierPaiementParEmploye[employe._id];
              
              return (
                <tr key={employe._id}>
                  <td className="matriculez">{employe.matricule}</td>
                  <td className="nomz">{employe.nom}  {employe.prenom}</td>
                  
                  <td className="dernier-moisz">
                    {dernierPaiement ? (
                     <span className="mois-payze">{formatMois(dernierPaiement.mois)}</span>

                    ) : (
                      <span className="aucun-paiementzz">Aucun paiement</span>
                    )}
                  </td>
                  <td className="date-paiementz">
          {dernierPaiement ? (
            <span className="date-payez">
              {dernierPaiement.datePaiement 
                ? new Date(dernierPaiement.datePaiement).toLocaleDateString('fr-FR')
                : 'Non définie'
              }
            </span>
          ) : (
            <span className="aucune-datez">—</span>
          )}
        </td>
                  <td className="salaire-basez">{(employe.salaireBase ?? 0).toLocaleString()} MGA</td>

                  <td className="enfantsz">{employe.nombreEnfants || 0}</td>
                
<td className="statut-paiementz">
  {dernierPaiement ? (
    <span className={`statut-badgezzz statut-${dernierPaiement.statut}`}>
      {dernierPaiement.statut === 'validé' ? '✅ Validé' : 'Payé'}
    </span>
  ) : (
    <span className="no-statutz">—</span>
  )}
</td><td className="actionsz">
  {dernierPaiement && (
    <>
      <button 
        className="btn-fichez"
        onClick={() => openHistorique(employe)}
        title="Voir la fiche de paie et l'historique"
      >
         Fiche
      </button>
      
      <button 
        className="btn-modifierz"
        onClick={() => navigateToEdit(dernierPaiement)}
        title={
          dernierPaiement.statut === 'payé' 
            ? "Impossible de modifier un paiement payé" 
            : "Modifier le dernier paiement"
        }
        disabled={dernierPaiement.statut === 'payé'}
      >
         Modif
      </button>
      
      <button 
        className="btn-mvolaz"
        onClick={() => ouvrirPaiementMvola(employe)}
        title={
          dernierPaiement.statut === 'payé' 
            ? "Voir les détails du paiement MVola" 
            : "Payer avec MVola"
        }
        disabled={!dernierPaiement || dernierPaiement.statut !== 'validé'}
      >
        {dernierPaiement.statut === 'payé' ? ' Payé' : ' MVola'}
      </button>
     
     <button 
  className="btn-supprimerz"
  onClick={() => openDeleteModal(dernierPaiement)}
  title={
    dernierPaiement.statut === 'payé' 
      ? "Impossible de supprimer un paiement payé" 
      : "Supprimer le dernier paiement"
  }
  disabled={dernierPaiement.statut === 'payé'}
>
   Supp
</button>
    </>
  )}
  <button 
    className="btn-creerz"
    onClick={() => navigateToCreate(employe)}
    title="Créer un nouveau paiement"
  >
     Créer
  </button>
</td>
                </tr>
              );
            })}
          </tbody>
          {totalPages > 1 && (
  <div className="paginationzzzz" >
    <button 
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="pagination-btnzzz"
     
    >
      ◀ Précédent
    </button>
    
    <span className="pagination-infozz" >
      Page {currentPage} sur {totalPages} 
    </span>
    
    <span style={{ fontSize: "12px", color: "#999" }}>
      ({totalEmployes} employé(s) au total)
    </span>
    
    <button 
      onClick={() => setCurrentPage(prev => prev + 1)}
      disabled={currentPage >= totalPages}
      className="pagination-btnzz"
     
    >
      Suivant ▶
    </button>
  </div>
)}

        </table>

        {filteredEmployes.length === 0 && (
          <div className="no-datazzz">Aucun employé trouvé</div>
        )}
      </div>
      
      {/* Modal Historique des paiements */}
{showHistorique && selectedEmploye && (
  <div className="modal-overlzay">
    <div className="modal-contenzzt large-modal">
      <div className="modal-headezr">
        <h3>Historique des paiements - {selectedEmploye.prenom} {selectedEmploye.nom}</h3>
        <button className="close-btzzn" onClick={() => setShowHistorique(false)}>×</button>
      </div>
      
      <div className="historique-tablez-container">
        <table className="historiquezz-table">
          <thead>
            <tr>
              <th>Mois</th>
              <th>Date paiement</th> 
              <th>Salaire net</th>
              <th>IRSA</th>
               
              <th>Taux Retraite</th>
              <th>Taux Maladie</th>
              <th>Assurance Sup</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
        {getPaiementsEmploye(selectedEmploye._id).map((paiement) => (
              <tr 
                key={paiement._id} 
                className={isDernierPaiement(paiement) ? "dernier-paiement-ligne" : ""}
              >
                
                <td>{formatMois(paiement.mois)}</td>
                 <td className="datezz-paiement">
        {paiement.datePaiement 
          ? new Date(paiement.datePaiement).toLocaleDateString('fr-FR')
          : 'Non définie'
        }
      </td>
                <td>{formatMontant(paiement.salaireNet)} MGA</td>
                <td>{formatMontant(paiement.irsa)} MGA</td>
           
                <td>{paiement.tauxCIMR}%</td>
                <td>{paiement.tauxMaladie}%</td>
                <td>{paiement.tauxRetraiteComp}%</td>
                     <td className="statut-paiezzment">
  <span className={`statut-badge statut-${paiement.statut}`}>
    {paiement.statut === 'validé' ? '✅ Validé' : '💰 Payé'}
  </span>
</td>
       {/* Dans l'historique - REMPLACER le select par un badge */}

<td className="actions-historizque">
  <button 
    className="btn-imprimzer"
    onClick={() => imprimerDernierPaiement(selectedEmploye)}
    title="Imprimer le dernier paiement"
  >
    🖨️ Imprimer
  </button>
  
  <button 
    className="btn-zz"
    onClick={() => openDetails(paiement)}
    title="Voir les détails des primes et déductions"
  >
    Fiche
  </button>
  
  {/* ✅ MODIFIER seulement dernier paiement - AVEC PROTECTION */}
  {isDernierPaiement(paiement) && (
    <button 
      className="btn-modifiezzr"
      onClick={() => navigateToEdit(paiement)}
      title={
        paiement.statut === 'payé' 
          ? "Impossible de modifier un paiement payé" 
          : "Modifier le dernier paiement"
      }
      disabled={paiement.statut === 'payé'}
      style={{
        opacity: paiement.statut === 'payé' ? 0.5 : 1,
        cursor: paiement.statut === 'payé' ? 'not-allowed' : 'pointer',
        backgroundColor: paiement.statut === 'payé' ? '#95a5a6' : ''
      }}
    >
      ✏️ Modifier
      {paiement.statut === 'payé' && ""}
    </button>
  )}
  {isDernierPaiement(paiement) && (
  <button 
    className="btn-supprimzer"
    onClick={() => openDeleteModal(paiement)}
    title={
      paiement.statut === 'payé' 
        ? "Impossible de supprimer un paiement payé" 
        : "Supprimer le dernier paiement"
    }
    disabled={paiement.statut === 'payé'}
    style={{
      opacity: paiement.statut === 'payé' ? 0.5 : 1,
      cursor: paiement.statut === 'payé' ? 'not-allowed' : 'pointer',
      backgroundColor: paiement.statut === 'payé' ? '#95a5a6' : ''
    }}
  >
    🗑️ Supprimer
    {paiement.statut === 'payé' && ""}
  </button>
)}
</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {getPaiementsEmploye(selectedEmploye._id).length === 0 && (
          <div className="no-dataz">Aucun paiement pour cet employé</div>
        )}
        {/* Modal Détails du paiement */}
{/* Modal Détails du paiement */}
{showDetails && selectedPaiement && (
  <div className="modal-overlazyss">
    <div className="modal-contenzzt large-modalss">
      <div className="modal-headerssz">
        <h3>Détails du paiement de {formatMois(selectedPaiement.mois)}  </h3>
        <button className="close-btnz" onClick={closeDetails}>×</button>
      </div>
      
      <div className="details-containssezr">
        {/* Informations de base */}
        <div className="details-sectiosnzzz">
          <h4>Informations générales</h4>
          <div className="details-grssidz">
            <div><strong>Employé:</strong> {selectedPaiement.employePrenom} {selectedPaiement.employeNom}</div>
            <div><strong>Mois:</strong> {formatMois(selectedPaiement.mois)}</div>
            <div><strong>Salaire de base:</strong> {formatMontant(selectedPaiement.salaireBase)} MGA</div>
            <div><strong>Salaire net:</strong> {formatMontant(selectedPaiement.salaireNet)} MGA</div>
            <div><strong>IRSA:</strong> {formatMontant(selectedPaiement.irsa)} MGA</div>
            
            {/* NOUVEAU : Affichage des taux utilisés */}
            <div><strong>Taux Retraite:</strong> {selectedPaiement.tauxCIMR}%</div>
            <div><strong>Taux Maladie:</strong> {selectedPaiement.tauxMaladie}%</div>
            <div><strong>Taux Assurance supplementaire:</strong> {selectedPaiement.tauxRetraiteComp}%</div>
          </div>
        </div>

        {/* Primes imposables */}
        <div className="details-sesctionz">
          <h4>Primes imposables ({formatMontant(selectedPaiement.totalPrimesImposables)} MGA)</h4>
          {selectedPaiement.primesImposables && selectedPaiement.primesImposables.length > 0 ? (
            <table className="detsails-tablessz">
              <thead>
                <tr>
                  <th>Libellé</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {selectedPaiement.primesImposables.map((prime, index) => (
                  <tr key={index}>
                    <td>{prime.designation || "Sans libellé"}</td>
                    <td>{formatMontant(prime.montant)} MGA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="nos-itemsz">Aucune prime imposable</p>
          )}
        </div>

        {/* ⭐⭐ NOUVELLE SECTION : Primes non imposables */}
        <div className="detasils-sectionz">
          <h4>Primes non imposables ({formatMontant(selectedPaiement.totalPrimesNonImposables)} MGA)</h4>
          {selectedPaiement.primesNonImposables && selectedPaiement.primesNonImposables.length > 0 ? (
            <table className="detasils-tablez">
              <thead>
                <tr>
                  <th>Libellé</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {selectedPaiement.primesNonImposables.map((prime, index) => (
                  <tr key={index}>
                    <td>{prime.designation || "Sans libellé"}</td>
                    <td>{formatMontant(prime.montant)} MGA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="sno-itemsz">Aucune prime non imposable</p>
          )}
        </div>

        {/* ⭐⭐ NOUVELLE SECTION : Déductions */}
        <div className="desstails-sectionz">
          <h4>Déductions ({formatMontant(selectedPaiement.totalDeductions)} MGA)</h4>
          {selectedPaiement.deductions && selectedPaiement.deductions.length > 0 ? (
            <table className="destails-tablez">
              <thead>
                <tr>
                  <th>Libellé</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {selectedPaiement.deductions.map((deduction, index) => (
                  <tr key={index}>
                    <td>{deduction.designation || "Sans libellé"}</td>
                    <td>{formatMontant(deduction.montant)} MGA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-itssemsz">Aucune déduction</p>
          )}
        </div>

  
      </div>

      <div className="modal-fosssoter">
        <button className="btn-secssondaryz" onClick={closeDetails}>
          Fermer
        </button>
      </div>
    </div>
  </div>
)}
     
  
      </div>
    </div>
  </div>
)}   
 {/* ⭐⭐ MODAL MVOLA - DOIT ÊTRE ICI, À LA FIN, APRÈS LES AUTRES MODALS ⭐⭐ */}
      {showMvola && selectedEmployeMvola && (
        <div className="modal-ovecsrlay">
          <div className="modal-contcsent large-modal">
            <div className="modal-hecsader">
              <h3 ></h3>
              <button 
                className="close-cs" 
                onClick={() => setShowMvola(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-bocsdy">
              <PaiementMvola 
                employe={selectedEmployeMvola}
                salaireNet={getDernierPaiementParEmploye()[selectedEmployeMvola._id]?.salaireNet || 0}
                onSuccess={() => {
                  setShowMvola(false);
                  fetchData(); // Recharger les données
                }}
                
              />
            </div>
          </div>
          
        </div>
        
      )}
      

      {/* ⭐⭐ MODAL DE SUPPRESSION - À METTRE ICI ⭐⭐ */}
      {showDeleteModal && paiementToDelete && (
        <div className="modal-overlay-delete">
          <div className="modal-content-delete">
            <div className="modal-header-delete">
              <h3>Confirmer la suppression</h3>
              <button className="close-btn-delete" onClick={closeDeleteModal}>×</button>
            </div>
            
            <div className="modal-body-delete">
              <div className="warning-icon">⚠️</div>
              <p>Êtes-vous sûr de vouloir supprimer le paiement de <strong>{formatMois(paiementToDelete.mois)}</strong> ?</p>
              <div className="delete-details">
                <p><strong>Employé:</strong> {paiementToDelete.employePrenom} {paiementToDelete.employeNom}</p>
                <p><strong>Salaire net:</strong> {formatMontant(paiementToDelete.salaireNet)} MGA</p>
                <p><strong>Statut:</strong> {paiementToDelete.statut === 'validé' ? 'Validé' : 'Payé'}</p>
              </div>
              <p className="warning-text">Cette action est irréversible.</p>
            </div>

            <div className="modal-footer-delete">
              <button 
                className="btn-cancel-delete"
                onClick={closeDeleteModal}
              >
                Annuler
              </button>
              <button 
                className="btn-confirm-delete"
                onClick={confirmDelete}
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div> 
  );
};

  

export default ListePaiements;