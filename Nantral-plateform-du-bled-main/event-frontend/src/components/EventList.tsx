import { formatDate } from "../utils/dateUtils";

interface EventListProps {
  title: string;
  events: Array<{
    id: number;
    movie_title: string;
    location: string;
    event_date: string;
    participant_count: number;
    creator_name?: string;
    description?: string;
  }>;
  isOwnProfile?: boolean;
  onDelete?: (eventId: number) => void;
}

export default function EventList({
  title,
  events,
  isOwnProfile = false,
  onDelete,
}: EventListProps) {
  return (
    <div className="events-section">
      <div className="section-header">
        <h2>{title}</h2>
      </div>
      <div className="events-list">
        {events.length === 0 ? (
          <p className="empty">Aucune séance</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="event-item">
              <div className="event-info">
                <h3>{event.movie_title}</h3>
                <div className="detail-row">
                  <span className="label">Lieu:</span>
                  <span>{event.location}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span>{formatDate(event.event_date)}</span>
                </div>
                {event.creator_name && (
                  <div className="detail-row">
                    <span className="label">Organisateur:</span>
                    <span>{event.creator_name}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Participants:</span>
                  <span>{event.participant_count}</span>
                </div>
                {event.description && <p className="event-description">{event.description}</p>}
                {isOwnProfile && (
                  <button className="delete-btn" onClick={() => onDelete?.(event.id)}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
