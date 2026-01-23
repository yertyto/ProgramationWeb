import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./styles/FilmsPage.scss";

interface Movie {
  id: number;
  title: string;
  movie_type: string;
  added_at: string;
}

interface PopularMovie {
  id: number;
  title: string;
  image: string;
}

const FilmsPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [toWatch, setToWatch] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [movieType, setMovieType] = useState<"favorite" | "to_watch">("favorite");
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const currentUserId = localStorage.getItem("userId");

  // Films populaires cette semaine
  const popularMovies: PopularMovie[] = [
    { id: 1, title: "Les parapluies de Cherbourg", image: "/Images_films/Parapluies.webp" },
    { id: 2, title: "Dancer in the Dark", image: "/Images_films/Dancer.webp" },
    { id: 3, title: "Twin peaks : Fire walk with me", image: "/Images_films/Twin.webp" },
    { id: 4, title: "Linda Linda Linda", image: "/Images_films/Linda.webp" },
    { id: 5, title: "Fire of Love", image: "/Images_films/fire.webp" },
    { id: 6, title: "L'evangile selon Saint Matthieu", image: "/Images_films/Evangile.webp" },
  ];

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${currentUserId}/movies`);
      const data = await response.json();
      setFavorites(data.favorites || []);
      setToWatch(data.toWatch || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovieTitle.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${currentUserId}/movies`, {
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
      await fetch(`http://localhost:5000/api/users/${currentUserId}/movies/${movieId}`, {
        method: "DELETE",
      });
      fetchMovies();
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  const Logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    window.location.reload();
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="films-page">
      <Navbar active="films" onLogout={Logout} currentUserId={localStorage.getItem("userId")} />

      <div className="page-content">
        <div className="header-section">
          <h2>Mes Films</h2>
          <p>Gérez vos films favoris et vos envies cinéma</p>
        </div>

        <div className="films-container">
          <div className="films-section popular-section">
            <div className="section-header">
              <h3> Films populaires cette semaine</h3>
            </div>
            <div className="popular-movies-grid">
              {popularMovies.map((movie) => (
                <div key={movie.id} className="popular-movie-card">
                  <div className="movie-image">
                    <img src={movie.image} alt={movie.title} />
                    <div className="movie-overlay">
                      <button 
                        className="add-to-favorites"
                        onClick={() => {
                          setNewMovieTitle(movie.title);
                          setMovieType("favorite");
                          setShowAddMovie(true);
                        }}
                      >
                        ♥ Favoris
                      </button>
                      <button 
                        className="add-to-watchlist"
                        onClick={() => {
                          setNewMovieTitle(movie.title);
                          setMovieType("to_watch");
                          setShowAddMovie(true);
                        }}
                      >
                         À voir
                      </button>
                    </div>
                  </div>
                  <div className="movie-info">
                    <h4>{movie.title}</h4>

                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="films-section">
            <div className="section-header">
              <h3> Ma Watchlist</h3>
              <button 
                className="btn-add" 
                onClick={() => {
                  setMovieType("to_watch");
                  setNewMovieTitle("");
                  setShowAddMovie(true);
                }}
              >
                + Ajouter
              </button>
            </div>
            <div className="movies-grid">
              {toWatch.length === 0 ? (
                <p className="empty-message">Aucun film dans votre watchlist</p>
              ) : (
                toWatch.map((movie) => (
                  <div key={movie.id} className="movie-card">
                    <div className="movie-content">
                      <h4>{movie.title}</h4>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteMovie(movie.id)}
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddMovie && (
        <div className="modal-overlay" onClick={() => setShowAddMovie(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              Ajouter un film {movieType === "favorite" ? "favori" : "à regarder"}
            </h2>
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

export default FilmsPage;
