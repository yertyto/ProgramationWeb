interface MyMovieListProps {
  title: string;
  movies: Array<{ id: number; title: string; added_at: string }>;
  onDelete: (movieId: number) => void;
}

export default function MyMovieList({ title, movies, onDelete }: MyMovieListProps) {
  return (
    <div className="list-category">
      <h3>{title}</h3>
      <div className="movies-list">
        {movies.length === 0 ? (
          <p className="empty-message">Aucun film dans cette catégorie</p>
        ) : (
          movies.map((movie) => (
            <div key={movie.id} className="my-movie-card">
              <div className="movie-details">
                <h4>{movie.title}</h4>
                <p className="added-date">
                  Ajouté le {new Date(movie.added_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <button
                className="delete-btn"
                onClick={() => onDelete(movie.id)}
                title="Supprimer"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
