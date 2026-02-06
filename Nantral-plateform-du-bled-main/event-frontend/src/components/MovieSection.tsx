interface MovieSectionProps {
  title: string;
  movies: Array<{ id: number; title: string; added_at: string }>;
  isOwnProfile: boolean;
  onAdd?: () => void;
  onDelete?: (movieId: number) => void;
}

export default function MovieSection({ title, movies, isOwnProfile, onAdd, onDelete }: MovieSectionProps) {
  return (
    <div className="movies-section">
      <div className="section-header">
        <h2>{title}</h2>
        {isOwnProfile && (
          <button className="add-btn" onClick={onAdd}>
            + Ajouter
          </button>
        )}
      </div>
      <div className="movies-grid">
        {movies.length === 0 ? (
          <p className="empty">Aucun film</p>
        ) : (
          movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <h3>{movie.title}</h3>
              {isOwnProfile && (
                <button className="delete-btn" onClick={() => onDelete?.(movie.id)}>
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
