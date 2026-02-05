# 🎬 Nantral Platform

```bash
git clone https://github.com/votre-utilisateur/Nantral-plateform-du-bled-main.git
cd Nantral-plateform-du-bled-main
```

```bash
psql -U postgres
```

```sql
CREATE DATABASE event_db;
\c event_db
\i setup-final.sql
```

```bash
cd event-backend
cp .env.example .env
```

Éditez `event-backend/.env` et mettez votre mot de passe PostgreSQL

```bash
cd event-backend
npm install
```

```bash
cd event-frontend
npm install
```

```bash
cd event-backend
npm start
```

```bash
cd event-frontend
npm run dev
```

**http://localhost:5173/**

🎉 **L'application fonctionne !**
