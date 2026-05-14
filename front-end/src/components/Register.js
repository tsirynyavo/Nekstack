import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/register", data);
      
      // Sauvegarder utilisateur dans localStorage
      localStorage.setItem("user", JSON.stringify(response.data));

      // Rediriger vers admin dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue");
    }
  };

  return (
    <div>
      <h2>Inscription</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input name="name" placeholder="Nom" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} />
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}
