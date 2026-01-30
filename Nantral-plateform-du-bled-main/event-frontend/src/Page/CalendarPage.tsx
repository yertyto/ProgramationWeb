// Ce fichier gère la page du calendrier des événements

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./styles/CalendarPage.scss";

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
  created_at: string;
  is_participant?: boolean;
  participants?: Array<{ id: number; username: string }>;
}

const CalendarPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    movieTitle: "",
    location: "",
    eventDate: "",
    eventTime: "",
    description: "",
    maxParticipants: "70",
  });

  const currentUserId = localStorage.getItem("userId");
  const hoursOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutesOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const url = currentUserId 
        ? `http://localhost:5000/api/events?userId=${currentUserId}`
        : "http://localhost:5000/api/events";
      const response = await fetch(url);
      const data = await response.json();
      
      // Récupérer les participants pour chaque événement
      const eventsWithParticipants = await Promise.all(
        (data.events || []).map(async (event: Event) => {
          try {
            const participantsResponse = await fetch(`http://localhost:5000/api/events/${event.id}/participants`);
            const participantsData = await participantsResponse.json();
            return {
              ...event,
              participants: participantsData.participants || []
            };
          } catch (error) {
            console.error(`Error fetching participants for event ${event.id}:`, error);
            return { ...event, participants: [] };
          }
        })
      );
      
      setEvents(eventsWithParticipants);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      alert("Vous devez être connecté");
      return;
    }

    if (!formData.movieTitle || !formData.location || !formData.eventDate || !formData.eventTime) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    const dateTime = `${formData.eventDate}T${formData.eventTime}:00`;

    try {
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          createdBy: Number(currentUserId),
          movieTitle: formData.movieTitle,
          location: formData.location,
          eventDate: dateTime,
          description: formData.description,
          maxParticipants: Number(formData.maxParticipants),
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          movieTitle: "",
          location: "",
          eventDate: "",
          eventTime: "",
          description: "",
          maxParticipants: "10",
        });
        fetchEvents();
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Erreur lors de la création de l'événement");
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
   

    try {
      console.log("Sending DELETE to:", `http://localhost:5000/api/events/${eventId}`);
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Response status:", response.status, "OK:", response.ok);

      if (response.ok) {
        // Retirer l'événement de la liste locale
        setEvents(events.filter(e => e.id !== eventId));
    
      } else {
        const errorText = await response.text();
        console.error("Delete failed:", errorText);
        alert("Erreur: " + errorText);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Erreur: " + error);
    }
  };

  const handleJoinEvent = async (eventId: number) => {
    if (!currentUserId) {
      alert("Vous devez être connecté");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(currentUserId) }),
      });

      if (response.ok) {
        // Refetcher les événements pour mettre à jour la liste complète
        fetchEvents();
      } else {
        const error = await response.json();
        alert(error.error || "Impossible de rejoindre l'événement");
      }
    } catch (error) {
      console.error("Error joining event:", error);
      alert("Erreur lors de la participation");
    }
  };

  const handleLeaveEvent = async (eventId: number) => {
    if (!currentUserId) {
      alert("Vous devez être connecté");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/leave`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(currentUserId) }),
      });

      if (response.ok) {
        // Refetcher les événements pour mettre à jour la liste complète
        fetchEvents();
      } else {
        alert("Erreur lors du départ");
      }
    } catch (error) {
      console.error("Error leaving event:", error);
      alert("Erreur lors du départ");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Paris"
    });
  };

  const Logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    window.location.reload();
  };

  const isCreator = (createdBy: number) => Number(currentUserId) === createdBy;

  return (
    <div className="calendar-page">
      <Navbar active="sessions" onLogout={Logout} currentUserId={localStorage.getItem("userId")} />

      <div className="page-content">
        <div className="header-section">
          <h2>Séances de Film</h2>
          <p>Organisez des séances de ciné avec vos potos ^^</p>
          <button className="btn-create-session" onClick={() => setShowCreateModal(true)}>
            + Créer une Séance
          </button>
        </div>

        {loading ? (
          <p className="loading">Chargement...</p>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <button className="btn-create-first" onClick={() => setShowCreateModal(true)}>
              Créer la première séance
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => {
              const showDeleteBtn = isCreator(event.created_by);
              console.log(`Event ${event.id}: created_by=${event.created_by}, currentUserId=${currentUserId}, showDeleteBtn=${showDeleteBtn}`);
              
              return (
                <div key={event.id} className="event-card">
                  {showDeleteBtn && (
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("BUTTON CLICKED!");
                        handleDeleteEvent(event.id);
                      }}
                      title="Supprimer cette séance"
                      type="button"
                    >
                      ×
                    </button>
                  )}
                  <div className="event-header">
                    <h3>{event.movie_title}</h3>
                    <span className="participant-badge">
                      {event.participant_count}/{event.max_participants || "∞"}
                    </span>
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
                {currentUserId && !isCreator(event.created_by) && (
                  <div className="event-actions">
                    {event.is_participant ? (
                      <button
                        className="btn-leave"
                        onClick={() => handleLeaveEvent(event.id)}
                        type="button"
                      >
                        Quitter
                      </button>
                    ) : (
                      <button
                        className="btn-join"
                        onClick={() => handleJoinEvent(event.id)}
                        type="button"
                        disabled={event.max_participants && event.participant_count >= event.max_participants}
                      >
                        {event.max_participants && event.participant_count >= event.max_participants ? "Max participants déjà atteint" : "Rejoindre"}
                      </button>
                    )}
                  </div>
                )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Créer une Nouvelle Séance</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label>Film</label>
                <input
                  type="text"
                  placeholder="Titre du film"
                  value={formData.movieTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, movieTitle: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Lieu</label>
                <input
                  type="text"
                  placeholder="Lieu de la séance"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) =>
                      setFormData({ ...formData, eventDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Heure </label>
                  <div className="time-input-group">
                    <select
                      value={formData.eventTime.split(":")[0] || ""}
                      onChange={(e) => {
                        const hours = e.target.value;
                        const minutes = formData.eventTime.split(":")[1] || "00";
                        setFormData({ ...formData, eventTime: `${hours}:${minutes}` });
                      }}
                      required
                    >
                      <option value="" disabled>
                        HH
                      </option>
                      {hoursOptions.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                    <span className="time-separator">:</span>
                    <select
                      value={formData.eventTime.split(":")[1] || ""}
                      onChange={(e) => {
                        const hours = formData.eventTime.split(":")[0] || "00";
                        const minutes = e.target.value;
                        setFormData({ ...formData, eventTime: `${hours}:${minutes}` });
                      }}
                      required
                    >
                      <option value="" disabled>
                        MM
                      </option>
                      {minutesOptions.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Nombre de participants max</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    setFormData({ ...formData, maxParticipants: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (optionnel)</label>
                <textarea
                  placeholder="Informations supplémentaires..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </button>
                <button type="submit">
                  Créer la Séance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;