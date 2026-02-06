interface AddMovieModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (value: string) => void;
  value: string;
}

export default function AddMovieModal({ isOpen, title, onClose, onSubmit, onChange, value }: AddMovieModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Titre du film"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
          <div className="modal-buttons">
            <button type="button" onClick={onClose}>
              Annuler
            </button>
            <button type="submit">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  );
}
