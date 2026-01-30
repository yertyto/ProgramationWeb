import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Sonicbleu44',
  database: 'event_db'
});

async function migrate() {
  try {
    console.log('Adding max_participants column...');
    await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 10');
    console.log('✓ Column added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

migrate();
