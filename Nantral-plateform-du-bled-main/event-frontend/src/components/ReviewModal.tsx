interface ReviewModalProps {
  isOpen: boolean;
  movieTitle: string;
  rating: string;
  comment: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onMovieTitleChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  isLoading?: boolean;
}

export default function ReviewModal({
  isOpen,
  movieTitle,
  rating,
  comment,
  onClose,
  onSubmit,
  onMovieTitleChange,
  onRatingChange,
  onCommentChange,
  isLoading = false,
}: ReviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Ajouter une Critique</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Film</label>
            <input
              type="text"
              placeholder="Titre du film"
              value={movieTitle}
              onChange={(e) => onMovieTitleChange(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Note</label>
            <select
              value={rating}
              onChange={(e) => onRatingChange(e.target.value)}
              required
            >
              {Array.from({ length: 10 }, (_, i) => (10 - i) / 2).map((r) => (
                <option key={r} value={r}>
                  {r} / 5
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Commentaire (optionnel)</label>
            <textarea
              placeholder="Votre avis sur le film"
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              rows={4}
            />
          </div>

          <div className="modal-buttons">
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Chargement..." : "Enregistrer"}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
