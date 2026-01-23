import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./styles/UserProfilePage.scss";

interface Movie {
  id: number;
  title: string;
  movie_type: string;
  added_at: string;
}

interface Event {
  id: number;
  created_by: number;
  creator_name: string;
  movie_title: string;
  location: string;
  event_date: string;
  description: string;
  participant_count: number;
  created_at: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
}

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [toWatch, setToWatch] = useState<Movie[]>([]);
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [movieType, setMovieType] = useState<"favorite" | "to_watch">("favorite");
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    fetchUserData();
    fetchMovies();
    fetchOrganizedEvents();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();
      const foundUser = data.users.find((u: UserData) => u.id === Number(userId));
      if (foundUser) {
        setUser(foundUser);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/movies`);
      const data = await response.json();
      setFavorites(data.favorites || []);
      setToWatch(data.toWatch || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizedEvents = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/events`);
      const data = await response.json();
      setOrganizedEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching organized events:", error);
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovieTitle.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newMovieTitle, movieType }),
      });

      if (response.ok) {
        setNewMovieTitle("");
        setShowAddMovie(false);
        fetchMovies();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  };

  const handleDeleteMovie = async (movieId: number) => {
    if (!confirm("Supprimer ce film ?")) return;

    try {
      await fetch(`http://localhost:5000/api/users/${userId}/movies/${movieId}`, {
        method: "DELETE",
      });
      fetchMovies();
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOwnProfile = currentUserId === userId;

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="user-profile-page">
      <Navbar active="profile" onLogout={() => { localStorage.removeItem("token"); localStorage.removeItem("username"); localStorage.removeItem("userId"); window.location.reload(); }} currentUserId={localStorage.getItem("userId")} />
      <button className="back-button" onClick={() => navigate("/events")}> 
        Retour
      </button>

      <div className="profile-header">
        <div className="avatar">{user?.username.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <h1>{user?.username}</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="movies-section">
        <div className="section-header">
          <h2>Films Favoris</h2>
          {isOwnProfile && (
            <button
              className="add-btn"
              onClick={() => {
                setMovieType("favorite");
                setShowAddMovie(true);
              }}
            >
              + Ajouter
            </button>
          )}
        </div>
        <div className="movies-grid">
          {favorites.length === 0 ? (
            <p className="empty"></p>
          ) : (
            favorites.map((movie) => (
              <div key={movie.id} className="movie-card">
                <h3>{movie.title}</h3>
                {isOwnProfile && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteMovie(movie.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="movies-section">
        <div className="section-header">
          <h2>Films à Voir</h2>
          {isOwnProfile && (
            <button
              className="add-btn"
              onClick={() => {
                setMovieType("to_watch");
                setShowAddMovie(true);
              }}
            >
              + Ajouter
            </button>
          )}
        </div>
        <div className="movies-grid">
          {toWatch.length === 0 ? (
            <p className="empty"></p>
          ) : (
            toWatch.map((movie) => (
              <div key={movie.id} className="movie-card">
                <h3>{movie.title}</h3>
                {isOwnProfile && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteMovie(movie.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="events-section">
        <div className="section-header">
          <h2>Séances Organisées</h2>
        </div>
        <div className="events-list">
          {organizedEvents.length === 0 ? (
            <p className="empty">Aucune séance organisée</p>
          ) : (
            organizedEvents.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-info">
                  <h3>{event.movie_title}</h3>
                  <div className="detail-row">
                    <span className="icon">📍</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="icon">📅</span>
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="icon">👥</span>
                    <span>{event.participant_count} participant{event.participant_count > 1 ? "s" : ""}</span>
                  </div>
                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddMovie && (
        <div className="modal-overlay" onClick={() => setShowAddMovie(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Ajouter un film</h2>
            <form onSubmit={handleAddMovie}>
              <input
                type="text"
                placeholder="Titre du film"
                value={newMovieTitle}
                onChange={(e) => setNewMovieTitle(e.target.value)}
                autoFocus
              />
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowAddMovie(false)}>
                  Annuler
                </button>
                <button type="submit">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
