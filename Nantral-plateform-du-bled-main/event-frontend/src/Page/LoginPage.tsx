// Ce fichier gère la page de connexion de l'application 

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../API/auth-actions";
import "./styles/LoginPage.scss";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(username, password);
      console.log("LOGIN OK", res);
      window.location.reload();
    } catch (err: any) {
      console.error(err.message);
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Le bazar du Tommy !!</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <div className="signup-link">
          <p>Pas encore de compte ?</p>
          <button 
            className="btn-secondary" 
            onClick={() => navigate("/signup")}
            type="button"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}
