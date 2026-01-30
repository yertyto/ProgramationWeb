-- Table des critiques de films
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

CREATE INDEX IF NOT EXISTS idx_user_movie_reviews_user ON public.user_movie_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_movie_reviews_title ON public.user_movie_reviews(movie_title);
