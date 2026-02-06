import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ReviewModal from "../components/ReviewModal";
import TmdbMovieGrid from "../components/TmdbMovieGrid";
import MyMovieList from "../components/MyMovieList";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";
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
  "amaury": "Un ptit truc en plus",
  "hugo delaruelle": "riche",
  "chloe moalic": "belle de jour",
  "milo soulard": "le gout du riz",
  "nicolas": "slut",
  "liam": "corée du nord, un plan",
  "moalic": "j'aurais pu etre une",
  "eloi": "Napoleon en australie",
  "rayan": "kaguya-sama : love is war",
  "zakaria": "fumer fait tousser",
  "guillaume": "Si tu tends l'oreille",
  "julien": "big mamma",
  "bastien lavaux": "lol",
  "fatoumata": "Un senegalais en Normandie",
  "lucas": "baywatch",
  "richard": "l'etrange histoire de benjamin button",
};

const FilmsPage = () => {
  const { toasts, removeToast, success, error } = useToast();
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
        handleSearch(new Event("submit") as any, nextPage);
      } else {
        loadPopularMovies(nextPage);
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      if (searchQuery.trim()) {
        handleSearch(new Event("submit") as any, prevPage);
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
        success("Critique enregistrée ✓");
      } else {
        const errResponse = await response.json();
        error(errResponse.error || "Erreur lors de la création de la critique");
      }
    } catch (err) {
      error("Erreur lors de la création de la critique");
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

    try {
      const response = await fetch(`http://localhost:5000/api/users/${currentUserId}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: movieTitle, movieType: type }),
      });

      if (response.ok) {
        const message = `"${movieTitle}" ajouté aux ${type === "favorite" ? "favoris" : "à regarder"}`;
        success(message);
        fetchMovies();
      } else {
        const errResponse = await response.json();
        error(errResponse.error || "Erreur lors de l'ajout du film");
      }
    } catch (err) {
      console.error("Error adding movie:", err);
      error("Erreur lors de l'ajout du film");
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

return (
    <div className="films-page">
      <Navbar active="films" onLogout={Logout} currentUserId={currentUserId} />

      <div className="page-content">
        <div className="header-section">
          <h2>Films</h2>
          <div className="tabs">
            <button className={`tab ${activeTab === "discover" ? "active" : ""}`} onClick={() => setActiveTab("discover")}>
              Découvrir
            </button>
            <button className={`tab ${activeTab === "my-list" ? "active" : ""}`} onClick={() => setActiveTab("my-list")}>
              Ma liste
            </button>
          </div>
        </div>

        {activeTab === "discover" ? (
          <>
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
              {!isApiKeyConfigured() && <p className="api-warning">Configurez votre clé API TMDB dans src/API/tmdb.ts</p>}
            </div>

            <TmdbMovieGrid
              movies={tmdbMovies}
              isLoading={searchLoading}
              onAddFavorite={(title) => handleAddMovie(title, "favorite")}
              onAddToWatch={(title) => handleAddMovie(title, "to_watch")}
              onAddReview={handleOpenReview}
              getImageUrl={getImageUrl}
            />

            <div className="pagination">
              <button onClick={handlePreviousPage} disabled={currentPage === 1 || searchLoading} className="btn-pagination">
                ← Précédente
              </button>
              <span className="page-info">
                Page {currentPage} sur {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={currentPage >= totalPages || searchLoading} className="btn-pagination">
                Suivante →
              </button>
            </div>

            {tmdbMovies.length === 0 && !searchLoading && <div className="empty-state"><p>Aucun film trouvé.</p></div>}
          </>
        ) : (
          <div className="my-list-section">
            <MyMovieList title=" Favoris" movies={favorites} onDelete={handleDeleteMovie} />
            <MyMovieList title=" À regarder" movies={toWatch} onDelete={handleDeleteMovie} />
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        movieTitle={reviewMovieTitle}
        rating={reviewRating}
        comment={reviewComment}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        onMovieTitleChange={setReviewMovieTitle}
        onRatingChange={setReviewRating}
        onCommentChange={setReviewComment}
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default FilmsPage;
