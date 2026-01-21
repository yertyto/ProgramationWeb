import { useEffect, useState } from "react";
import "./styles/EventsPage.scss";

interface User {
  id: string;
  username: string;
  email: string;
}

export default function EventsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = localStorage.getItem("username") || "Utilisateur";

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading users:", err);
        setLoading(false);
      });
  }, []);

  const Logout = () => { // Déconnexion de l'utilisateur
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.reload();
  };

  return ( // 
    <div className="events-page">
      <header className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <h1 className="site-title">Le bazar de Tommy</h1>
            <nav className="nav-links">
              <a href="#" className="nav-link active">MEMBRES</a>
              <a href="#" className="nav-link">ACTIVITE</a>
            </nav>
          </div>
          <button className="btn-logout" onClick={Logout}>
            DÉCONNEXION
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="welcome-section">
          <h2>Bienvenue, {currentUser}.</h2>
        </div>

        <div className="members-section">
          <div className="section-header">
            <h3>NOUVEAUX MEMBRES</h3>
            <a href="#" className="view-all">TOUS LES MEMBRES</a>
          </div>

          {loading ? (
            <p className="loading">Chargement...</p>
          ) : users.length === 0 ? (
            <p className="no-data">Aucun membre inscrit</p>
          ) : (
            <div className="members-grid">
              {users.map((user) => (
                <div key={user.id} className="member-card">
                  <div className="member-avatar">
                    <span>{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="member-info">
                    <h4>{user.username}</h4>
                    <p>{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
