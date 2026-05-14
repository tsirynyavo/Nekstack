import React, { useState } from "react";
import axios from "axios";
import "../components/ChangePassword.css";

const ChangePassword = ({ employe }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fonction pour extraire l'année de naissance
  const getAnneeNaissance = () => {
    if (!employe.datenaissance) return "Non définie";
    return new Date(employe.datenaissance).getFullYear().toString();
  };

  // Fonction pour gérer le changement de mot de passe
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    // Validations (4 caractères minimum)
    if (passwordForm.newPassword.length < 4) {
      setPasswordMessage("Le mot de passe doit contenir au moins 4 caractères");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5050/employees/${employe._id}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordMessage("✅ Mot de passe modifié avec succès");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
    } catch (error) {
      setPasswordMessage(error.response?.data?.error || "Erreur lors de la modification");
    }
  };

  // Fonction pour réinitialiser le mot de passe à l'année de naissance
  const handleResetToDefaultPassword = async () => {
    if (window.confirm("Voulez-vous vraiment réinitialiser votre mot de passe à votre année de naissance ?")) {
      try {
        const response = await axios.put(`http://localhost:5050/employees/${employe._id}/reset-default-password`);
        
        setPasswordMessage(`✅ Mot de passe réinitialisé à votre année de naissance (${getAnneeNaissance()})`);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        
      } catch (error) {
        setPasswordMessage(error.response?.data?.error || "Erreur lors de la réinitialisation");
      }
    }
  };

  return (
    <div className="vchange-password-page">
      <div className="vpassword-header">
        <h2>🔒 Gestion du mot de passe</h2>
        <p>Modifiez ou réinitialisez votre mot de passe de connexion</p>
      </div>

      <div className="vpassword-actions">
        {/* Section Réinitialisation rapide */}
        <div className="vreset-section">
          <h3>🔄 Réinitialisation rapide</h3>
          <p>
            <strong>Mot de passe par défaut :</strong> Votre année de naissance ({getAnneeNaissance()})
          </p>
          <button 
            onClick={handleResetToDefaultPassword}
            className="vbtn-reset-default"
          >
            Réinitialiser à l'année de naissance
          </button>
          <p className="vreset-info">
            Utilisez cette option si vous avez oublié votre mot de passe actuel
          </p>
        </div>

        {/* Section Modification */}
        <div className="vchange-section">
          <h3>✏️ Modification du mot de passe</h3>
          <form onSubmit={handleChangePassword} className="vpassword-form">
            <div className="vinput-group">
              <label>Mot de passe actuel</label>
              <div className="vpassword-input-wrapper">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  placeholder="Saisissez votre mot de passe actuel"
                  required
                />
                <button 
                  type="button"
                  className="vpassword-toggle"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            
            <div className="vinput-group">
              <label>Nouveau mot de passe (min. 4 caractères)</label>
              <div className="vpassword-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  placeholder="Saisissez votre nouveau mot de passe"
                  required
                  minLength="4"
                />
                <button 
                  type="button"
                  className="vpassword-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            
            <div className="vinput-group">
              <label>Confirmer le nouveau mot de passe</label>
              <div className="vpassword-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                />
                <button 
                  type="button"
                  className="vpassword-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            
            {passwordMessage && (
              <div className={`vpassword-message ${passwordMessage.includes('✅') ? 'success' : 'error'}`}>
                {passwordMessage}
              </div>
            )}
            
            <div className="vform-actions">
              <button type="submit" className="vbtn-save">Enregistrer le nouveau mot de passe</button>
              <button 
                type="button" 
                onClick={() => {
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setPasswordMessage("");
                }}
                className="vbtn-clear"
              >
                Effacer
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="vpassword-security-tips">
        <h4>💡 Conseils de sécurité</h4>
        <ul>
          <li>Votre mot de passe doit contenir au moins 4 caractères</li>
          <li>Le mot de passe par défaut est votre année de naissance</li>
          <li>Changez régulièrement votre mot de passe pour plus de sécurité</li>
          <li>Ne partagez jamais votre mot de passe avec d'autres personnes</li>
        </ul>
      </div>
    </div>
  );
};

export default ChangePassword;