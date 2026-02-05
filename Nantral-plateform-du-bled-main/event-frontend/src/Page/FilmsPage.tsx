import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { searchMovies, getPopularMovies, getImageUrl, isApiKeyConfigured } from "../API/tmdb";
import type { TMDBMovie } from "../API/tmdb";
import "./styles/FilmsPage.scss";

interface Movie {
  id: number;
  title: string;
  movie_type: string;
  added_at: string;
}

// Mapping de mots-clés vers des films spécifiques
const KEYWORD_TO_MOVIE: Record<string, string> = {
  "meilleur film monde": "Dancer in the Dark",
  "omar montino": "italien pour debutants",
  "bastien felix": "forrest gump",
  "christine yejin": "Chine",
  "amaury" : "Un ptit truc en plus",
  "hugo delaruelle" : "riche",
  "chloe moalic" : "belle de jour",
  "milo soulard" : "le gout du riz",
  "nicolas" : "slut",
  "liam" : "corée du nord, un plan",
  "moalic" : "j'aurais pu etre une",
  "eloi" : "Napoleon en australie",
  "rayan" : "kaguya-sama : love is war",
  "zakaria" : "fumer fait tousser",
  "guillaume" : "Si tu tends l'oreille",
  "julien" : "big mamma",
  "bastien lavaux" : "lol",
  "fatoumata" : "Un senegalais en Normandie",
  "lucas" : "baywatch",
  "richard" : "l'etrange histoire de benjamin button",

};  

const FilmsPage = () => {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [toWatch, setToWatch] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [movieType, setMovieType] = useState<"favorite" | "to_watch">("favorite");
  const currentUserId = localStorage.getItem("userId");
  
  // TMDB
  const [searchQuery, setSearchQuery] = useState("");
  const [tmdbMovies, setTmdbMovies] = useState<TMDBMovie[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"discover" | "my-list">("discover");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewMovieTitle, setReviewMovieTitle] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    fetchMovies();
    loadPopularMovies();
  }, []);

  const loadPopularMovies = async (page: number = 1) => {
    if (!isApiKeyConfigured()) {
      console.warn("TMDB API key not configured");
      return;
    }
    try {
      const data = await getPopularMovies(page);
      setTmdbMovies(data.results);
      setTotalPages(data.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading popular movies:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent, page: number = 1) => {
    e.preventDefault();
    if (!searchQuery.trim() || !isApiKeyConfigured()) return;
    
    setSearchLoading(true);
    try {
      // Vérifier si la recherche correspond à un mot-clé défini
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const queryToUse = KEYWORD_TO_MOVIE[normalizedQuery] || searchQuery;
      
      const data = await searchMovies(queryToUse, page);
      setTmdbMovies(data.results);
      setTotalPages(data.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error searching movies:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      if (searchQuery.trim()) {
        handleSearch(new Event('submit') as any, nextPage);
      } else {
        loadPopularMovies(nextPage);
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      if (searchQuery.trim()) {
        handleSearch(new Event('submit') as any, prevPage);
      } else {
        loadPopularMovies(prevPage);
      }
    }
  };

  const handleOpenReview = (movieTitle: string) => {
    if (!currentUserId) {
      alert("Vous devez être connecté");
      return;
    }
    setReviewMovieTitle(movieTitle);
    setReviewRating("5");
    setReviewComment("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      alert("Vous devez être connecté");
      return;
    }

    if (!reviewMovieTitle.trim() || !reviewRating) {
      alert("Veuillez remplir la note");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${currentUserId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieTitle: reviewMovieTitle,
          rating: Number(reviewRating),
          comment: reviewComment,
        }),
      });

      if (response.ok) {
        setShowReviewModal(false);
        setReviewMovieTitle("");
        setReviewRating("5");
        setReviewComment("");
        alert("Critique enregistrée");
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la création de la critique");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      alert("Erreur lors de la création de la critique");
    }
  };

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

  const handleAddMovie = async (movieTitle: string, type: "favorite" | "to_watch") => {
    if (!movieTitle.trim()) return;
   
    alert(`"${movieTitle}" a été ajouté à votre liste ${type === "favorite" ? "des favoris" : "à regarder"}.`);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${currentUserId}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: movieTitle, movieType: type }),
      });

      if (response.ok) {
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
    //if (!confirm("Supprimer ce film ?")) return;

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
          <h2>Films</h2>
          
          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'discover' ? 'active' : ''}`}
              onClick={() => setActiveTab('discover')}
            >
              Découvrir
            </button>
            <button 
              className={`tab ${activeTab === 'my-list' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-list')}
            >
              Ma liste
            </button>
          </div>
        </div>

        {activeTab === 'discover' ? (
          <>
            {}
            <div className="search-section">
              <form onSubmit={handleSearch} className="search-bar">
                <input
                  type="text"
                  placeholder="Rechercher un film..."
                  value={searchQuery} 

                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" disabled={searchLoading}>
                  {searchLoading ? "..." : "Rechercher"}

                </button>
              </form>
              {!isApiKeyConfigured() && (
                <p className="api-warning"> Configurez votre clé API TMDB dans src/API/tmdb.ts</p>
              )}
            </div>

            {}
            <div className="tmdb-movies-grid">
              {tmdbMovies.map((movie) => (
                <div key={movie.id} className="tmdb-movie-card">
                  <div className="movie-poster">
                    <img 
                      src={getImageUrl(movie.poster_path)} 
                      alt={movie.title}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-movie.png';
                      }}
                    />
                    <div className="movie-overlay">
                      <div className="movie-rating">🌟 {movie.vote_average.toFixed(1)}</div>
                      <div className="movie-actions">
                        <button 
                          className="btn-add-favorite"
                          onClick={() => handleAddMovie(movie.title, "favorite")}
                          title="Ajouter aux favoris"
                        >
                          ♥
                        </button>
                        <button 
                          className="btn-add-watchlist"
                          onClick={() => handleAddMovie(movie.title, "to_watch")}
                          title="Ajouter à ma liste"
                        >
                          +
                        </button>
                      
                        <button
                          className="btn-add-review"
                          title="Ajouter une critique"
                          onClick={() => handleOpenReview(movie.title)}
                          type="button"
                        >
                          🖋
                        </button>

                      </div>
                    </div>
     
                  </div>
                  <div className="movie-info">
                    <h4>{movie.title}</h4>
                    <p className="release-date">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>

          
            <div className="pagination">
              <button 
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || searchLoading}
                className="btn-pagination"
              >
                ← Précédente
              </button>
              <span className="page-info">Page {currentPage} sur {totalPages}</span>
              <button 
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || searchLoading}
                className="btn-pagination"
              >
                Suivante →
              </button>
            </div>

            {tmdbMovies.length === 0 && !searchLoading && (
              <div className="empty-state">
                <p>Aucun film trouvé.</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Ma liste */}
            <div className="my-list-section">
              <div className="list-category">
                <h3> Favoris</h3>
                <div className="movies-list">
                  {favorites.length === 0 ? (
                    <p className="empty-message">Aucun film favori</p>
                  ) : (
                    favorites.map((movie) => (
                      <div key={movie.id} className="my-movie-card">
                        <div className="movie-details">
                          <h4>{movie.title}</h4>
                          <p className="added-date">
                            Ajouté le {new Date(movie.added_at).toLocaleDateString('fr-FR')}
                          </p>
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

              <div className="list-category">
                <h3> À regarder</h3>
                <div className="movies-list">
                  {toWatch.length === 0 ? (
                    <p className="empty-message">Aucun film dans votre watchlist</p>
                  ) : (
                    toWatch.map((movie) => (
                      <div key={movie.id} className="my-movie-card">
                        <div className="movie-details">
                          <h4>{movie.title}</h4>
                          <p className="added-date">
                            Ajouté le {new Date(movie.added_at).toLocaleDateString('fr-FR')}
                          </p>
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
          </>
        )}

        {showReviewModal && (
          <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Ajouter une critique</h2>
              <form onSubmit={handleSubmitReview}>
                <input
                  type="text"
                  value={reviewMovieTitle}
                  readOnly
                />
                <label>Note (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Votre commentaire..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
                <div className="modal-buttons">
                  <button type="button" onClick={() => setShowReviewModal(false)}>
                    Annuler
                  </button>
                  <button type="submit">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilmsPage;
