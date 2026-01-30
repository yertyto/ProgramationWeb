CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Événements (structure alignée avec server.js)
CREATE TABLE IF NOT EXISTS public.events (
  id SERIAL PRIMARY KEY,
  created_by INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  movie_title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  event_date TIMESTAMP NOT NULL,
  description TEXT,
  max_participants INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participants des événements
CREATE TABLE IF NOT EXISTS public.event_participants (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- Films d'un utilisateur (favoris / à regarder)
CREATE TABLE IF NOT EXISTS public.user_movies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  movie_type VARCHAR(20) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, title, movie_type)
);

-- Critiques de films par utilisateur
CREATE TABLE IF NOT EXISTS public.user_movie_reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  movie_title VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, movie_title)
);

-- Index pour accélérer les requêtes principales
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_creator ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_movies_user ON public.user_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_movie_reviews_user ON public.user_movie_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_movie_reviews_title ON public.user_movie_reviews(movie_title);
