import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProfileHeader from "../components/ProfileHeader";
import MovieSection from "../components/MovieSection";
import EventList from "../components/EventList";
import AddMovieModal from "../components/AddMovieModal";
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
}

interface UserData {
  id: number;
  username: string;
  email: string;
}

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserData | null>(null);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [toWatch, setToWatch] = useState<Movie[]>([]);
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [movieType, setMovieType] = useState<"favorite" | "to_watch">("favorite");
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    fetchUserData();
    fetchMovies();
    fetchOrganizedEvents();
    fetchJoinedEvents();
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

  const fetchJoinedEvents = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/joined-events`);
      const data = await response.json();
      setJoinedEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching joined events:", error);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/reviews`);
      const data = await response.json();
      // Suppression de la fonction - plus nécessaire
    } catch (error) {
      console.error("Error fetching reviews:", error);
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
    // if (!confirm("Supprimer ce film ?")) return;

    try { //http://localhost:5173
      await fetch(`http://localhost:5000/api/users/${userId}/movies/${movieId}`, {
        method: "DELETE",
      });
      fetchMovies();
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!isOwnProfile) return;
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setOrganizedEvents(organizedEvents.filter(e => e.id !== eventId));
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Erreur lors de la suppression");
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
      <Navbar
        active="profile"
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("userId");
          window.location.reload();
        }}
        currentUserId={currentUserId}
      />

      {user && <ProfileHeader username={user.username} email={user.email} />}

      <MovieSection
        title="Films Favoris"
        movies={favorites}
        isOwnProfile={isOwnProfile}
        onAdd={() => {
          setMovieType("favorite");
          setShowAddMovie(true);
        }}
        onDelete={handleDeleteMovie}
      />

      <MovieSection
        title="Films à Voir"
        movies={toWatch}
        isOwnProfile={isOwnProfile}
        onAdd={() => {
          setMovieType("to_watch");
          setShowAddMovie(true);
        }}
        onDelete={handleDeleteMovie}
      />

      <EventList title="Séances Organisées" events={organizedEvents} isOwnProfile={isOwnProfile} onDelete={handleDeleteEvent} />

      <EventList title="Séances Rejointes" events={joinedEvents} />

      <AddMovieModal
        isOpen={showAddMovie}
        title={`Ajouter un film (${movieType === "favorite" ? "Favoris" : "À regarder"})`}
        onClose={() => setShowAddMovie(false)}
        onSubmit={handleAddMovie}
        onChange={setNewMovieTitle}
        value={newMovieTitle}
      />
    </div>
  );
};

export default UserProfilePage;
