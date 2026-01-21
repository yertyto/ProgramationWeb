import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../API/auth-actions";
import "./styles/SignupPage.scss";

export default function SignupPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        setLoading(true);

        try {
            const user = await signup(username, email, password);
            setSuccess(`Compte créé avec succès !`);
            setUsername("");
            setEmail("");
            setPassword("");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h1>Inscrit toi mon pote ;)</h1>
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
                        <label>Adresse email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        {loading ? "Inscription..." : "Créer un compte"}
                    </button>
                </form>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <div className="login-link">
                    <p>Déjà un compte ?</p>
                    <button 
                        className="btn-secondary" 
                        onClick={() => navigate("/login")}
                        type="button"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        </div>
    );
}
