// ce fichier gère la page des événements, affichant les membres et permettant la déconnexion

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./styles/EventsPage.scss";

interface User {
  id: string;
  username: string;
  email: string;
}

export default function EventsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const currentUser = localStorage.getItem("username") || "Utilisateur";
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/users") //
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

  const Logout = () => { 
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    window.location.reload();
  };

  const handleMemberClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return ( 
    <div className="events-page">
      <Navbar active="members" onLogout={Logout} currentUserId={localStorage.getItem("userId")} />

      <div className="page-content">
        <div className="welcome-section">
          <h2>Bienvenue, {currentUser}.</h2>
        </div>

        <div className="members-section">
          <h3>Membres inscrits</h3>

          {loading ? (
            <p className="loading">Chargement...</p>
          ) : users.length === 0 ? (
            <p className="no-data">Aucun membre inscrit</p>
          ) : (
            <div className="members-grid">
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className="member-card"
                  onClick={() => handleMemberClick(user.id)}
                >
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
