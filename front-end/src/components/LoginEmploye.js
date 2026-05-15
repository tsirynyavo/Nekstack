import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginEmploye = () => {
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5050/employees/login", {
        email,
        motdepasse
      });

      // On suppose que le backend renvoie l'employé et un token
      const { employe, token } = res.data;

      localStorage.setItem("employeToken", token); // pour auth futur
      localStorage.setItem("employeId", employe._id);

      navigate("/employee/profile"); // redirection vers profil
    } catch (err) {
      console.error(err);
      alert("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="login-form">
      <h2>Connexion Employé</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Mot de passe"
            value={motdepasse}
            onChange={e => setMotdepasse(e.target.value)}
            required
          />
        </div>
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default LoginEmploye;
