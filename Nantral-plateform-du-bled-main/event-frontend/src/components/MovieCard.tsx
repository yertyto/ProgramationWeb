interface MovieCardProps {
  id?: number;
  title: string;
  image?: string;
  rating?: number;
  isOwnProfile?: boolean;
  onDelete?: (movieId: number) => void;
  onAddFavorite?: () => void;
  onAddToWatch?: () => void;
  showActions?: boolean;
}

export default function MovieCard({
  id,
  title,
  image,
  rating,
  isOwnProfile = false,
  onDelete,
  onAddFavorite,
  onAddToWatch,
  showActions = false,
}: MovieCardProps) {
  // Library card style
  if (!image) {
    return (
      <div className="movie-card">
        <h3>{title}</h3>
        {isOwnProfile && (
          <button
            className="delete-btn"
            onClick={() => id && onDelete?.(id)}
          >
            ×
          </button>
        )}
      </div>
    );
  }

  // TMDB style with poster
  return (
    <div className="tmdb-movie-card">
      <div className="movie-poster">
        <img
          src={image}
          alt={title}
          onError={(e) => {
            e.currentTarget.src = "/placeholder-movie.png";
          }}
        />
        <div className="movie-overlay">
          {rating && <div className="movie-rating">🌟 {rating.toFixed(1)}</div>}
          {showActions && (
            <div className="movie-actions">
              <button
                className="btn-add-favorite"
                onClick={onAddFavorite}
                title="Ajouter aux favoris"
              >
                ♥
              </button>
              <button
                className="btn-add-towatch"
                onClick={onAddToWatch}
                title="Ajouter à regarder"
              >
                ▢
              </button>
            </div>
          )}
        </div>
      </div>
      <h3>{title}</h3>
    </div>
  );
}
