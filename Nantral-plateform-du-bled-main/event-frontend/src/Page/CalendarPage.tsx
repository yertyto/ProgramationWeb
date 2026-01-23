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
  created_at: string;
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
  });

  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/events");
      const data = await response.json();
      setEvents(data.events || []);
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

    const dateTime = `${formData.eventDate}T${formData.eventTime}:00`;

    try {
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          createdBy: currentUserId,
          movieTitle: formData.movieTitle,
          location: formData.location,
          eventDate: dateTime,
          description: formData.description,
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
        });
        fetchEvents();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Erreur lors de la création de l'événement");
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
    });
  };

  const Logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    window.location.reload();
  };

  return (
    <div className="calendar-page">
      <Navbar active="sessions" onLogout={Logout} currentUserId={localStorage.getItem("userId")} />




      <div className="page-content">
        <div className="header-section">
            
          <h2>Séances de Film</h2>
          <p>Organisez des séances de ciné avec vos potos ^^</p>
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
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h3>{event.movie_title}</h3>
                  <span className="participant-badge">
                    {event.participant_count} 👤
                  </span>
                </div>
                <div className="event-details">
                  <div className="detail-row">
                    <span className="icon">📍</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="icon"></span>
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="icon"></span>
                    <span>Organisé par {event.creator_name}</span>
                  </div>
                  {event.description && (
                    <div className="event-description">
                      <p>{event.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
                  placeholder=""
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
                  <label>Heure</label>
                  <input
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) =>
                      setFormData({ ...formData, eventTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description (optionnel)</label>
                <textarea
                  placeholder="Informations..."
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
                <button type="submit" onClick={() => setShowCreateModal(false)}>
                    Créer la Séance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
