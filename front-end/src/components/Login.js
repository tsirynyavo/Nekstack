// components/Login.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('user');
    if (auth) {
      navigate("/etudiants"); // redirection si déjà connecté
    }
  }, [navigate]);

  const handleLogin = async () => {
    setError(false);
    setEmailError(false);
    setLoginError('');

    if (!email || !password) {
      setError(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(true);
      return;
    }

    try {
      let response = await fetch("http://localhost:5000/login", {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let result = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(result));
        navigate("/reserver");
      } else {
        setLoginError(result.error || "Connexion refusée");
      }
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setLoginError("Erreur de connexion au serveur");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className='login'>
      <h1>Connexion Utilisateur</h1>

      <label htmlFor="email">Email</label>
      <input
        type="text"
        className="inputBox"
        placeholder="Entrez votre email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      {error && !email && <span className='invalid-input'>Email requis</span>}
      {emailError && <span className='invalid-input'>Email invalide</span>}

      <label htmlFor="password">Mot de passe</label>
      <input
        type="password"
        className="inputBox"
        placeholder="Entrez votre mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      {error && !password && <span className='invalid-input'>Mot de passe requis</span>}

      {loginError && <div style={{ color: "red", marginTop: "10px" }}>❌ {loginError}</div>}

      <button onClick={handleLogin} className="appButton">Connexion</button>
      <Link to="/register">Créer un compte</Link>

      {/* Lien pour aller à la connexion admin */}
      <p style={{ marginTop: '15px' }}>
        Vous êtes un admin ?{' '}
        <Link to="/admin/login" style={{ color: 'blue', textDecoration: 'underline' }}>
          Connectez-vous ici
        </Link>
        
      </p>
    </div>
  );
};

export default Login;
