//  ce fichier gère le serveur backend de l'application d'événements avec des fonctionnalités d'inscription, de connexion et de validation des utilisateurs

import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const app = express();
const PORT = 5000;
const JWT_SECRET = "dev_secret_change_me";

app.use(cors());
app.use(express.json());

app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existing = await pool.query(
      "SELECT id FROM public.users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Username or email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO public.users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, passwordHash]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query( // Récupère l'utilisateur par nom d'utilisateur
      "SELECT id, username, password_hash FROM public.users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0]; // Récupère l'utilisateur
    const isMatch = await bcrypt.compare(password, user.password_hash); // Vérifie le mot de passe

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign( // Génère un token JWT
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token }); // Renvoie le token au client
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

app.get("/api/validate", async (req, res) => {
  const authHeader = req.headers.authorization; // LE HEADER SERT A TRANSMETTRE LE TOKEN
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: { id: decoded.id, username: decoded.username } });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email FROM public.users ORDER BY id DESC"
    );
    res.json({ users: result.rows, count: result.rows.length });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Server error fetching users" });
  }
});

// Récupérer les films d'un utilisateur 
app.get("/api/users/:userId/movies", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      "SELECT id, title, movie_type, added_at FROM user_movies WHERE user_id = $1 ORDER BY added_at DESC",
      [userId]
    );

    const favorites = result.rows.filter(m => m.movie_type === 'favorite');
    const toWatch = result.rows.filter(m => m.movie_type === 'to_watch');

    res.json({ 
      favorites,
      toWatch,
      count: result.rows.length 
    });
  } catch (err) {
    console.error("Get user movies error:", err);
    res.status(500).json({ error: "Server error fetching movies" });
  }
});

// Ajouter un film pour un utilisateur
app.post("/api/users/:userId/movies", async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, movieType } = req.body;

    if (!title || !movieType) {
      return res.status(400).json({ error: "Missing title or movieType" });
    }

    if (!['favorite', 'to_watch'].includes(movieType)) {
      return res.status(400).json({ error: "Invalid movieType. Must be 'favorite' or 'to_watch'" });
    }

    const result = await pool.query(
      "INSERT INTO user_movies (user_id, title, movie_type) VALUES ($1, $2, $3) RETURNING id, title, movie_type, added_at",
      [userId, title, movieType]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "Movie already exists in this list" });
    }
    console.error("Add movie error:", err);
    res.status(500).json({ error: "Server error adding movie" });
  }
});

// Supprimer un film
app.delete("/api/users/:userId/movies/:movieId", async (req, res) => {
  try {
    const { userId, movieId } = req.params;
    
    await pool.query(
      "DELETE FROM user_movies WHERE id = $1 AND user_id = $2",
      [movieId, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Delete movie error:", err);
    res.status(500).json({ error: "Server error deleting movie" });
  }
});

// Récupérer les critiques d'un utilisateur
app.get("/api/users/:userId/reviews", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT id, movie_title, rating, comment, created_at, updated_at
       FROM user_movie_reviews
       WHERE user_id = $1
       ORDER BY updated_at DESC, created_at DESC`,
      [userId]
    );

    res.json({ reviews: result.rows, count: result.rows.length });
  } catch (err) {
    console.error("Get user reviews error:", err);
    res.status(500).json({ error: "Server error fetching reviews" });
  }
});

// Ajouter ou mettre à jour une critique
app.post("/api/users/:userId/reviews", async (req, res) => {
  try {
    const { userId } = req.params;
    const { movieTitle, rating, comment } = req.body;

    if (!movieTitle || !rating) {
      return res.status(400).json({ error: "Missing movieTitle or rating" });
    }

    const ratingValue = Number(rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
    }

    const result = await pool.query(
      `INSERT INTO user_movie_reviews (user_id, movie_title, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, movie_title)
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = CURRENT_TIMESTAMP
       RETURNING id, movie_title, rating, comment, created_at, updated_at`,
      [userId, movieTitle, ratingValue, comment || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ error: "Server error adding review" });
  }
});

// Récupérer tous les événements
app.get("/api/events", async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (userId) {
      const result = await pool.query(
        `SELECT e.*, u.username as creator_name,
         CAST((SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) AS INTEGER) as participant_count,
         CASE WHEN ep.user_id IS NOT NULL THEN true ELSE false END as is_participant
         FROM events e
         JOIN users u ON e.created_by = u.id
         LEFT JOIN event_participants ep ON e.id = ep.event_id AND ep.user_id = $1
         ORDER BY e.event_date ASC`,
        [parseInt(userId)]
      );
      res.json({ events: result.rows });
    } else {
      const result = await pool.query(
        `SELECT e.*, u.username as creator_name,
         CAST((SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) AS INTEGER) as participant_count,
         false as is_participant
         FROM events e
         JOIN users u ON e.created_by = u.id
         ORDER BY e.event_date ASC`
      );
      res.json({ events: result.rows });
    }
  } catch (err) {
    console.error("Get events error:", err);
    res.status(500).json({ error: "Server error fetching events" });
  }
});

// Créer un nouvel événement
app.post("/api/events", async (req, res) => {
  try {
    const { createdBy, movieTitle, location, eventDate, description, maxParticipants } = req.body;

    if (!createdBy || !movieTitle || !location || !eventDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO events (created_by, movie_title, location, event_date, description, max_participants) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, created_by, movie_title, location, event_date, description, max_participants, created_at`,
      [createdBy, movieTitle, location, eventDate, description || null, maxParticipants || null]
    );

    // Ajouter automatiquement le créateur comme participant
    await pool.query(
      "INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2)",
      [result.rows[0].id, createdBy]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ error: "Server error creating event" });
  }
});

// Rejoindre un événement
app.post("/api/events/:eventId/join", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const capacityResult = await client.query(
        `SELECT max_participants,
         (SELECT COUNT(*) FROM event_participants WHERE event_id = $1) AS participant_count
         FROM events WHERE id = $1
         FOR UPDATE`,
        [eventId]
      );

      if (capacityResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Event not found" });
      }

      const { max_participants, participant_count } = capacityResult.rows[0];
      if (max_participants !== null && Number(participant_count) >= Number(max_participants)) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "Event is full" });
      }

      await client.query(
        "INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2)",
        [eventId, userId]
      );

      await client.query("COMMIT");
      res.status(201).json({ success: true });
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "Already joined this event" });
    }
    console.error("Join event error:", err);
    res.status(500).json({ error: "Server error joining event" });
  }
});

// Quitter un événement
app.delete("/api/events/:eventId/leave", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    await pool.query(
      "DELETE FROM event_participants WHERE event_id = $1 AND user_id = $2",
      [eventId, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Leave event error:", err);
    res.status(500).json({ error: "Server error leaving event" });
  }
});

// Récupérer les participants d'un événement
app.get("/api/events/:eventId/participants", async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, ep.joined_at
       FROM event_participants ep
       JOIN users u ON ep.user_id = u.id
       WHERE ep.event_id = $1
       ORDER BY ep.joined_at ASC`,
      [eventId]
    );

    res.json({ participants: result.rows });
  } catch (err) {
    console.error("Get participants error:", err);
    res.status(500).json({ error: "Server error fetching participants" });
  }
});

// Récupérer les événements organisés par un utilisateur
app.get("/api/users/:userId/events", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT e.*, u.username as creator_name,
       (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count
       FROM events e
       JOIN users u ON e.created_by = u.id
       WHERE e.created_by = $1
       ORDER BY e.event_date ASC`,
      [userId]
    );

    res.json({ events: result.rows });
  } catch (err) {
    console.error("Get user events error:", err);
    res.status(500).json({ error: "Server error fetching user events" });
  }
});

// Récupérer les événements auxquels l'utilisateur a rejoint
app.get("/api/users/:userId/joined-events", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT e.*, u.username as creator_name,
       (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count
       FROM events e
       JOIN users u ON e.created_by = u.id
       JOIN event_participants ep ON e.id = ep.event_id
       WHERE ep.user_id = $1 AND e.created_by != $1
       ORDER BY e.event_date ASC`,
      [userId]
    );

    res.json({ events: result.rows });
  } catch (err) {
    console.error("Get joined events error:", err);
    res.status(500).json({ error: "Server error fetching joined events" });
  }
});

app.delete("/api/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Supprimer d'abord les participants
    await pool.query(
      "DELETE FROM event_participants WHERE event_id = $1",
      [eventId]
    );

    // Puis supprimer l'événement
    await pool.query(
      "DELETE FROM events WHERE id = $1",
      [eventId]
    );

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ error: "Server error deleting event" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
