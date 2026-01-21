-- ============================================
-- IMPORTANT: Exécutez ces commandes dans pgAdmin ou psql
-- ============================================

-- Méthode 1: Si la colonne n'existe pas encore
ALTER TABLE public.users 
ADD COLUMN email VARCHAR(255) UNIQUE;

-- Méthode 2: Si vous voulez recréer la table complètement
-- (ATTENTION: cela supprime toutes les données existantes!)
/*
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

-- Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'users' 
    AND table_schema = 'public'
ORDER BY 
    ordinal_position;

-- Voir tous les utilisateurs inscrits
SELECT * FROM public.users;
