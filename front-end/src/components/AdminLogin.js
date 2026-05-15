import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Shield, UserCircle } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("admin");
    if (auth) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    setError(false);
    setEmailError(false);
    setLoginError("");
    setLoading(true);

    if (!email || !password) {
      setError(true);
      setLoading(false);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError(true);
      setLoading(false);
      return;
    }

    try {
      let response = await fetch("http://localhost:5050/admin-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      let result = await response.json();

      if (response.ok) {
        localStorage.setItem("admin", JSON.stringify(result));
        navigate("/admin/dashboard");
      } else {
        setLoginError(result.result || "Accès admin refusé");
      }
    } catch (err) {
      setLoginError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Motif de grille (comme sur RoadTrafficPage) */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/[0.03] backdrop-blur-sm border border-cyan-500/20 rounded-3xl p-8 shadow-2xl">
          {/* Icône admin avec animation flottante (simulée via transition) */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg ring-4 ring-cyan-500/30 animate-float">
              <Shield size={40} className="text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-black text-center bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Connexion Admin
          </h2>
          <p className="text-center text-slate-500 text-sm mb-8">
            Accédez à votre espace d'administration
          </p>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Champ Email */}
            <div>
              <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                Email admin
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={`w-full bg-white/[0.05] border rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all ${
                    (error && !email) || emailError
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-cyan-500/20 focus:border-cyan-400/50"
                  }`}
                  placeholder="admin@example.com"
                />
              </div>
              {(error && !email) && (
                <p className="text-red-400 text-xs mt-1">Veuillez entrer un email</p>
              )}
              {emailError && (
                <p className="text-red-400 text-xs mt-1">Email invalide</p>
              )}
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                Mot de passe admin
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={`w-full bg-white/[0.05] border rounded-xl py-3 pl-10 pr-12 text-slate-200 placeholder-slate-600 outline-none transition-all ${
                    error && !password
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-cyan-500/20 focus:border-cyan-400/50"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={handleClickShowPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && !password && (
                <p className="text-red-400 text-xs mt-1">Veuillez entrer un mot de passe</p>
              )}
            </div>

            {/* Message d'erreur global */}
            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {loginError}
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Se connecter"
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cyan-500/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#0a0a0f] text-slate-500">Options</span>
              </div>
            </div>

            {/* Liens de navigation */}
            <div className="text-center space-y-3">
              <p className="text-sm text-slate-400">
                Pas encore de compte ?{" "}
                <Link
                  to="/admin/register"
                  className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                >
                  S'inscrire
                </Link>
              </p>
              <p className="text-sm text-slate-400">
                Vous êtes un employé ?{" "}
                <Link
                  to="/citoyen/login"
                  className="text-green-400 hover:text-green-300 font-bold transition-colors"
                >
                  Connexion employé
                </Link>
              </p>
            </div>
          </form>

          {/* Badge en bas */}
          <div className="text-center mt-8 text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">
            FIANARA SMART CITY
          </div>
        </div>
      </div>

      {/* Animation flottante personnalisée (ajoutez ceci dans votre fichier CSS global si besoin) */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default AdminLogin;