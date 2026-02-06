import { formatDate, isEventPast } from "../utils/dateUtils";

interface Event {
  id: number;
  created_by: number;
  creator_name: string;
  movie_title: string;
  location: string;
  event_date: string;
  description: string;
  participant_count: number;
  max_participants?: number;
  is_participant?: boolean;
  participants?: Array<{ id: number; username: string }>;
}

interface EventCardProps {
  event: Event;
  isCreator: boolean;
  currentUserId: string | null;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;
  onJoin?: (eventId: number) => void;
  onLeave?: (eventId: number) => void;
}

export default function EventCard({
  event,
  isCreator,
  currentUserId,
  onEdit,
  onDelete,
  onJoin,
  onLeave,
}: EventCardProps) {
  const isPast = isEventPast(event.event_date);
  const isFull = event.max_participants && event.participant_count >= event.max_participants;

  return (
    <div className={`event-card ${isPast ? "event-past" : ""}`}>
      {isCreator && (
        <div className="creator-actions">
          <button
            className="edit-btn"
            onClick={() => onEdit?.(event)}
            title="Modifier cette séance"
            type="button"
          >
            ✎
          </button>
          <button
            className="delete-btn"
            onClick={() => onDelete?.(event.id)}
            title="Supprimer cette séance"
            type="button"
          >
            ×
          </button>
        </div>
      )}

      <div className="event-header">
        <h3>{event.movie_title}</h3>
        <div className="event-badges">
          {isPast && <span className="status-badge status-past">Événement passé</span>}
          <span className="participant-badge">
            {event.participant_count}/{event.max_participants || "∞"}
          </span>
        </div>
      </div>

      <div className="event-details">
        <div className="detail-row">
          <span className="label">Lieu:</span>
          <span>{event.location}</span>
        </div>
        <div className="detail-row">
          <span className="label">Date:</span>
          <span>{formatDate(event.event_date)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Organisateur:</span>
          <span>{event.creator_name}</span>
        </div>

        {event.description && (
          <div className="event-description">
            <p>{event.description}</p>
          </div>
        )}

        {event.participants && event.participants.length > 0 && (
          <div className="participants-section">
            <div className="participants-label">Participants ({event.participants.length}):</div>
            <div className="participants-list">
              {event.participants.map((participant) => (
                <div key={participant.id} className="participant-item">
                  {participant.username}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {currentUserId && !isCreator && (
        <div className="event-actions">
          {isPast ? (
            <button className="btn-past" disabled type="button">
              Inscription fermée
            </button>
          ) : event.is_participant ? (
            <button className="btn-leave" onClick={() => onLeave?.(event.id)} type="button">
              Quitter
            </button>
          ) : (
            <button
              className="btn-join"
              onClick={() => onJoin?.(event.id)}
              type="button"
              disabled={!!isFull}
            >
              {isFull ? "Max participants déjà atteint" : "Rejoindre"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
