import './App.css';
import Nav from './components/Nav';
import 'leaflet/dist/leaflet.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import SignUp from './components/Register';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import PrivateComponent from './components/PrivateComponent';
import AdminPrivateComponent from './components/AdminPrivateComponent';
import AdminRegister from './components/AdminRegister';
import Report from './components/Report';
import RoutingMachine from './components/RoutingMachine.jsx'


import AdminDashboard from './components/AdminDashboard';

import Logout from './components/Logout';
import ManageStudents from './components/ManageStudents'; // Nouveau composant
 // Nouveau composant pour gérer les chambres
import ReservationList from './components/ReservationList';
import ReservationForm from './components/ReservationForm';
import HomeRedirect from './components/HomeRedirect';
import StudentForm from './components/StudentForm';
import RoomForm from './components/RoomForm';
import StudentsView from './components/StudentsView';


import ChangePassword from './components/ChangePassword.js';
import FormAide from './components/FormAide';
import UserProfileCitoyen from './components/UserProfileCitoyen';
import ListQuartier from './components/ListQuartier';
import FormQuartier from './components/FormQuartier';

import FormDepartement from './components/FormDepartement';
import ListCitoyen from './components/ListCitoyen.js';
import FormCitoyen from './components/FormCitoyen';
import ViewCitoyen from './components/ViewCitoyen';
import HistoryEmploye from './components/HistoryEmploye';
import ListAide from './components/ListAide';

import DemandesEnCours from "./components/DemandesEnCours";
import MarkPresence from './components/MarkPresence';
import TableauStatistiquesComplet from './components/TableauStatistiquesComplet';
import PresenceEmploye from "./components/PresenceEmploye"; // ajuste le chemin
import RapportPresence from './components/RapportPresence';
import RapportAide from './components/RapportAide';
import Rapports from './components/Rapports';
import RapportRessource from './components/RapportRessource';
import FormRessource from './components/FormRessource';
import ListRessource  from './components/ListRessource';
import FormPaiement from './components/FormPaiement';
import ListePaiements from './components/ListePaiements.js';
import PaiementEmploye from "./components/PaiementEmploye";
import PaiementMvola from './components/PaiementMvola';
import ListMarche from './components/ListMarche';
import FormMarche from './components/FormMarche.js';
import ViewNoteInterne from './components/ViewNoteInterne.js';
import ListReservation from './components/ListReservation.js';
import FormReservation from './components/FormReservation.js';
import StatistiquesGenerales from './components/StatistiquesGenerales';
import ListTaches from './components/ListTaches.js';
import FormTache from './components/FormTache.js';
import ViewTache from './components/ViewTache.js';
import Parametres from './components/Parametres.js';
import RapportQuartier from './components/RapportQuartier.js';
import ViewMarche from './components/ViewMarche.js';
import RoadTrafficPage from "./components/RoadTrafficPage.jsx";
 

function App() {
  return (
    <div className="app-container">
         
      <BrowserRouter>

        <Nav />

        {/* Conteneur principal pour tout le contenu sauf le footer */}
        <div className="main-content">
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/login" element={<AdminLogin />} />
  <Route path="/admin/dashboard" element={<StatistiquesGenerales />} />


            <Route path="/citoyen/login" element={<UserProfileCitoyen />} />
           <Route path="/citoyen/RoadTrafficPage" element={<RoadTrafficPage />} />


            <Route path="/employee/demandes-en-cours" element={<DemandesEnCours />} />


            <Route path="/employee/presence" element={<PresenceEmploye />} />




            <Route path="/employee/paiements" element={<PaiementEmploye />} />

  {/* NOUVELLE ROUTE POUR LE MOT DE PASSE */}
        <Route path="/employee/password" element={<ChangePassword />} />


            {/* Routes utilisateurs */}
            <Route element={<PrivateComponent />}>
              <Route path="/etudiants" element={<StudentsView />} />
            </Route>

            {/* Routes admin */}
            <Route element={<AdminPrivateComponent />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/logout" element={<Logout />} />
              // Dans votre fichier de routing
<Route path="/admin/parametres" element={<Parametres />} />
              

             
              <Route path="/admin/paiement/add" element={<RoomForm />} />
              <Route path="/admin/paiement/edit/:id" element={<RoomForm />} />

              <Route path="/admin/paiements/mvola" element={<PaiementMvola />} />


              <Route path="/admin/RoutingMachine" element={<RoutingMachine />} />
 

              <Route path="/admin/etudiants" element={<ManageStudents />} />
              <Route path="/admin/etudiants/add" element={<StudentForm />} />
              <Route path="/admin/etudiants/edit/:id" element={<StudentForm />} />








// Ajoute ces routes dans ton App.js
              <Route path="/admin/marche" element={<ListMarche />} />
              <Route path="/admin/marches/add" element={<FormMarche />} />
              <Route path="/admin/marches/edit/:id" element={<FormMarche />} />
              <Route path="/admin/marches/view/:id" element={<ViewMarche />} />


              // Dans votre App.js ou routes
<Route path="/admin/taches" element={<ListTaches />} />
<Route path="/admin/taches/add" element={<FormTache />} />
<Route path="/admin/taches/edit/:id" element={<FormTache />} />
<Route path="/admin/taches/view/:id" element={<ViewTache />} />

<Route path="/admin/reservations" element={<ListReservation />} />
<Route path="/admin/reservations/add" element={<FormReservation />} />
<Route path="/admin/reservations/edit/:id" element={<FormReservation />} />
             

               <Route path="/admin/departements/add" element={<FormDepartement />} />
              <Route path="/admin/departements/edit/:id" element={<FormDepartement />} />

              <Route path="/admin/quartiers" element={<ListQuartier />} />
              <Route path="/admin/quartiers/add" element={<FormQuartier />} />
              <Route path="/admin/quartiers/edit/:id" element={<FormQuartier />} />

              <Route path="/admin/ressource" element={<ListRessource />} />
              <Route path="/admin/ressource/add" element={<FormRessource />} />
              <Route path="/admin/ressource/edit/:id" element={<FormRessource />} />


              <Route path="/admin/aides" element={<ListAide />} />
              <Route path="/admin/aides/add" element={<FormAide />} />
              <Route path="/admin/aides/edit/:id" element={<FormAide />} />

                // Route principale pour la page Rapports
              <Route path="/admin/rapports" element={<Rapports />} />

// Routes individuelles pour chaque type de rapport
              <Route path="/admin/rapports/presence" element={<RapportPresence />} />
              <Route path="/admin/rapports/aides" element={<RapportAide />} />
              <Route path="/admin/rapports/ressource" element={<RapportRessource/>} />
              <Route path="/admin/rapports/quartiers" element={<RapportQuartier />} />*/
             
              // Gardez vos routes existantes
              <Route path="/admin/presences/mark" element={<MarkPresence />} />
        
              <Route path="/admin/statistiques-complet/:employeId" element={<TableauStatistiquesComplet />} />
        
<Route path="/admin/citoyens" element={<ListCitoyen />} />
<Route path="/admin/citoyens/add" element={<FormCitoyen />} />
<Route path="/admin/citoyens/edit/:id" element={<FormCitoyen />} />
<Route path="/admin/citoyens/view/:id" element={<ViewCitoyen />} />     <Route path="/admin/employees/history/:id" element={<HistoryEmploye />} /> {/* pour l’historique */}



                // Ajouter ces routes
              <Route path="/admin/paiements" element={<ListePaiements />} />
              <Route path="/admin/paiements/create" element={<FormPaiement />} />
              <Route path="/admin/paiements/edit/:id" element={<FormPaiement />} />


















              <Route path="/admin/note" element={<ReservationList />} />
              <Route path="/admin/note/add" element={<ReservationForm />} />
              <Route path="/admin/note/edit/:id" element={<ReservationForm />} />

              <Route path="/admin/rapport" element={<Report />} />


              <Route path="/" element={<HomeRedirect />} />
            </Route>
          </Routes>
        </div>

        {/* Footer hors du conteneur principal */}

      </BrowserRouter>
   
    </div>
  );
}

export default App;
