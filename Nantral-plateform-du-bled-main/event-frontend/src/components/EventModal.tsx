import { useState, useEffect } from "react";

interface EventFormData {
  movieTitle: string;
  location: string;
  eventDate: string;
  eventTime: string;
  description: string;
  maxParticipants: string;
}

interface EventModalProps {
  isOpen: boolean;
  title: string;
  formData: EventFormData;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof EventFormData, value: string) => void;
  isLoading?: boolean;
}

export default function EventModal({
  isOpen,
  title,
  formData,
  onClose,
  onSubmit,
  onChange,
  isLoading = false,
}: EventModalProps) {
  const hoursOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutesOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  if (!isOpen) return null;

  const timeParts = formData.eventTime.split(":");
  const hour = timeParts[0] || "00";
  const minute = timeParts[1] || "00";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Film</label>
            <input
              type="text"
              placeholder="Titre du film"
              value={formData.movieTitle}
              onChange={(e) => onChange("movieTitle", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Lieu</label>
            <input
              type="text"
              placeholder="Lieu de la séance"
              value={formData.location}
              onChange={(e) => onChange("location", e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => onChange("eventDate", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Heure</label>
              <div className="time-inputs">
                <select
                  value={hour}
                  onChange={(e) =>
                    onChange("eventTime", `${e.target.value}:${minute}`)
                  }
                >
                  {hoursOptions.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={minute}
                  onChange={(e) =>
                    onChange("eventTime", `${hour}:${e.target.value}`)
                  }
                >
                  {minutesOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Nombre de places</label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => onChange("maxParticipants", e.target.value)}
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Description (optionnel)</label>
            <textarea
              placeholder="Description de la séance"
              value={formData.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-buttons">
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Chargement..." : "Confirmer"}
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
