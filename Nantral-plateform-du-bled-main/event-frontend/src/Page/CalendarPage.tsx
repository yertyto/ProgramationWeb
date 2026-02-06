import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import EventModal from "../components/EventModal";
import ToastContainer from "../components/ToastContainer";
import { useToast } from "../hooks/useToast";
import { formatDateToInput } from "../utils/dateUtils";
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
  is_participant?: boolean;
  participants?: Array<{ id: number; username: string }>;
}

interface EventFormData {
  movieTitle: string;
  location: string;
  eventDate: string;
  eventTime: string;
  description: string;
  maxParticipants: string;
}

const CalendarPage = () => {
  const { toasts, removeToast, success, error } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    movieTitle: "",
    location: "",
    eventDate: "",
    eventTime: "00:00",
    description: "",
    maxParticipants: "70",
  });

  const currentUserId = localStorage.getItem("userId");

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

  const resetForm = () => {
    setFormData({
      movieTitle: "",
      location: "",
      eventDate: "",
      eventTime: "00:00",
      description: "",
      maxParticipants: "70",
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingEventId(null);
    resetForm();
  };

  const handleEditClick = (event: Event) => {
    const { date, time } = formatDateToInput(event.event_date);
    setFormData({
      movieTitle: event.movie_title,
      location: event.location,
      eventDate: date,
      eventTime: time,
      description: event.description || "",
      maxParticipants: String(event.max_participants || 100),
    });
    setEditingEventId(event.id);
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !editingEventId) {
      alert("Erreur de configuration");
      return;
    }

    const dateTime = `${formData.eventDate}T${formData.eventTime}:00`;

    try {
      const response = await fetch(`http://localhost:5000/api/events/${editingEventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(currentUserId),
          movieTitle: formData.movieTitle,
          location: formData.location,
          eventDate: dateTime,
          description: formData.description,
          maxParticipants: Number(formData.maxParticipants),
        }),
      });

      if (response.ok) {
        success("Séance modifiée avec succès");
        handleCloseEditModal();
        fetchEvents();
      } else {
        const errorText = await response.text();
        error(errorText || "Erreur lors de la modification");
      }
    } catch (err) {
      error("Erreur: " + (err instanceof Error ? err.message : String(err)));
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
        success(`Séance "${formData.movieTitle}" créée avec succès `);
        setShowCreateModal(false);
        setFormData({
          movieTitle: "",
          location: "",
          eventDate: "",
          eventTime: "00:00",
          description: "",
          maxParticipants: "10",
        });
        fetchEvents();
      } else {
        const errResponse = await response.json();
        error(errResponse.error || "Erreur lors de la création");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      error("Erreur lors de la création de l'événement");
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        success("Séance supprimée ");
        setEvents(events.filter(e => e.id !== eventId));
      } else {
        error("Erreur lors de la suppression");
      }
    } catch (err) {
      error("Erreur: " + err);
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
        success("Vous avez rejoint la séance ");
        // Refetcher les événements pour mettre à jour la liste complète
        fetchEvents();
      } else {
        const errResponse = await response.json();
        error(errResponse.error || "Impossible de rejoindre l'événement");
      }
    } catch (err) {
      console.error("Error joining event:", err);
      error("Erreur lors de la participation");
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
        success("Vous avez quitté la séance ");
        // Refetcher les événements pour mettre à jour la liste complète
        fetchEvents();
      } else {
        error("Erreur lors du départ");
      }
    } catch (err) {
      console.error("Error leaving event:", err);
      error("Erreur lors du départ");
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

  const handleFormChange = (field: keyof EventFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="calendar-page">
      <Navbar active="sessions" onLogout={Logout} currentUserId={currentUserId} />

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
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isCreator={isCreator(event.created_by)}
                currentUserId={currentUserId}
                onEdit={handleEditClick}
                onDelete={handleDeleteEvent}
                onJoin={handleJoinEvent}
                onLeave={handleLeaveEvent}
              />
            ))}
          </div>
        )}
      </div>

      <EventModal
        isOpen={showEditModal}
        title="Modifier la Séance"
        formData={formData}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateEvent}
        onChange={handleFormChange}
      />

      <EventModal
        isOpen={showCreateModal}
        title="Créer une Nouvelle Séance"
        formData={formData}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        onSubmit={handleCreateEvent}
        onChange={handleFormChange}
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default CalendarPage;