interface TmdbMovieGridProps {
  movies: Array<any>;
  isLoading: boolean;
  onAddFavorite: (title: string) => void;
  onAddToWatch: (title: string) => void;
  onAddReview: (title: string) => void;
  getImageUrl: (path: string | null) => string;
}

export default function TmdbMovieGrid({
  movies,
  isLoading,
  onAddFavorite,
  onAddToWatch,
  onAddReview,
  getImageUrl,
}: TmdbMovieGridProps) {
  return (
    <div className="tmdb-movies-grid">
      {movies.map((movie) => (
        <div key={movie.id} className="tmdb-movie-card">
          <div className="movie-poster">
            <img
              src={getImageUrl(movie.poster_path)}
              alt={movie.title}
              onError={(e) => {
                e.currentTarget.src = "/placeholder-movie.png";
              }}
            />
            <div className="movie-overlay">
              <div className="movie-rating">🌟 {movie.vote_average.toFixed(1)}</div>
              <div className="movie-actions">
                <button
                  className="btn-add-favorite"
                  onClick={() => onAddFavorite(movie.title)}
                  title="Ajouter aux favoris"
                >
                  ♥
                </button>
                <button
                  className="btn-add-watchlist"
                  onClick={() => onAddToWatch(movie.title)}
                  title="Ajouter à ma liste"
                >
                  +
                </button>
                <button
                  className="btn-add-review"
                  title="Ajouter une critique"
                  onClick={() => onAddReview(movie.title)}
                  type="button"
                >
                  🖋
                </button>
              </div>
            </div>
          </div>
          <div className="movie-info">
            <h4>{movie.title}</h4>
            <p className="release-date">
              {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
