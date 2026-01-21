// Ce fichier configure la connexion à la base de données PostgreSQL en utilisant le module 'pg'

import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  host: 'localhost', //PostgreSQL tourne localement
  port: 5432, // Port par défaut de PostgreSQL
  user: 'postgres', // Nom d'utilisateur de la base de données
  password: 'Sonicbleu44', // Mot de passe de l'utilisateur
  database: 'event_db', // Base de données cible
});

