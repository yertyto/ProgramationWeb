
### 1. Node.js 
Télécharger et installer : https://nodejs.org/

Vérifier l'installation :
```bash
node --version
npm --version
```

### 2. PostgreSQL 
Télécharger et installer : https://www.postgresql.org/download/

**Pendant l'installation :**
- Notez bien votre mot de passe PostgreSQL
- Gardez le port par défaut : 5432

Vérifier l'installation :
```bash
psql --version
```

### 3. Git
Télécharger et installer : https://git-scm.com/



## Installation du Projet
### Étape 1 : Cloner le projet

```bash
git clone https://github.com/votre-utilisateur/Nantral-plateform-du-bled-main.git
cd Nantral-plateform-du-bled-main
```

### Étape 2 : Configurer PostgreSQL
#### A. Créer la base de données

Ouvrir un terminal et taper :

psql -U postgres
(Entrer votre mot de passe PostgreSQL)

Dans le terminal PostgreSQL, taper :
```sql
CREATE DATABASE event_db;
\c event_db
\q
```

#### B. Importer les tables

```bash
cd event-backend
psql -U postgres -d event_db -f setup-final.sql
```
(Entrer votre mot de passe PostgreSQL)


### Étape 3 : Configurer le Backend
#### A. Créer le fichier .env

```bash
cd event-backend
cp .env.example .env
```

#### B. Éditer le fichier .env

Ouvrir `event-backend/.env` avec un éditeur de texte et remplacer :

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=VOTRE_MOT_DE_PASSE_POSTGRESQL_ICI
DB_NAME=event_db
PORT=5000
JWT_SECRET=dev_secret_change_me
NODE_ENV=development
```

**⚠️ Important :** Remplacez `VOTRE_MOT_DE_PASSE_POSTGRESQL_ICI` par votre vrai mot de passe PostgreSQL !

#### C. Installer les dépendances

```bash
npm install
```

### Étape 4 : Configurer le Frontend

```bash
cd ../event-frontend
npm install
```


## ▶️ Lancement de l'Application
### Vous devez ouvrir 2 terminaux :
#### Terminal 1 - Lancer le Backend

```bash
cd event-backend
npm start
```

Vous devriez voir :
```
Server running on http://localhost:5000
```

✅ Le backend fonctionne !

#### Terminal 2 - Lancer le Frontend

```bash
cd event-frontend
npm run dev
```

Vous devriez voir :
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

 Le frontend fonctionne !

---

##  Accéder à l'Application

Ouvrir votre navigateur et aller à :

**http://localhost:5173/**

 **L'application est prête !**


## 📱 Première Utilisation

1. **S'inscrire** : Créez un compte avec username, email et mot de passe
2. **Créer une séance** : Cliquez sur "+ Créer une Séance"
3. **Rejoindre une séance** : Parcourez les événements et cliquez "Rejoindre"
4. **Modifier votre séance** : Cliquez sur le bouton ✎ (si vous l'avez créée)
5. **Gérer vos films** : Allez sur votre profil pour ajouter des films favoris

---

## 🔧 Structure du Projet

```
Nantral-plateform-du-bled-main/
├── event-backend/              Backend (API REST)
│   ├── src/
│   │   ├── server.js          Serveur Express
│   │   └── auth/              Authentification JWT
│   ├── db.js                  Connexion PostgreSQL
│   ├── setup-final.sql        Structure de la base de données
│   ├── package.json
│   └── .env                   Configuration (à créer)
│
└── event-frontend/             Frontend (React + Vite)
    ├── src/
    │   ├── Page/              Pages (Login, Calendar, Profile, etc)
    │   ├── components/        Composants réutilisables
    │   └── API/               Appels API
    ├── package.json
    └── vite.config.ts
```


## Base de Données

PostgreSQL avec 5 tables :

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs inscrits (username, email, password) |
| `events` | Séances de ciné créées |
| `event_participants` | Liste des participants par séance |
| `user_movies` | Films favoris et à regarder |
| `user_movie_reviews` | Notes et critiques de films |

---

## Problèmes Courants

### "ECONNREFUSED" ou "Cannot connect to database"
**Problème :** PostgreSQL n'est pas démarré

**Solution Windows :**
- Ouvrir "Services" (services.msc)
- Chercher "postgresql"
- Clic droit > Démarrer

**Solution Mac :**
```bash
brew services start postgresql
```

**Solution Linux :**
```bash
sudo systemctl start postgresql
```

---

### "password authentication failed"
**Problème :** Mauvais mot de passe dans .env

**Solution :**
1. Vérifiez votre mot de passe PostgreSQL
2. Modifiez `event-backend/.env`
3. Relancez `npm start`

---

### "database "event_db" does not exist"
**Problème :** La base de données n'a pas été créée

**Solution :**
```bash
psql -U postgres
CREATE DATABASE event_db;
\c event_db
\q
```

---

### "Port 5000 already in use"
**Problème :** Un autre programme utilise le port 5000

**Solution Windows :**
```bash
netstat -ano | findstr :5000
taskkill /PID <le_numero_PID> /F
```

**Solution Mac/Linux :**
```bash
lsof -i :5000
kill -9 <le_numero_PID>
```

Ou changez le PORT dans `event-backend/.env`

---

### "Cannot find module"
**Problème :** Dépendances non installées

**Solution :**
```bash
cd event-backend
rm -rf node_modules
npm install

cd ../event-frontend
rm -rf node_modules
npm install
```

---

## 🔐 Sécurité

- ✅ Les mots de passe sont hashés avec bcrypt
- ✅ Authentification par JWT token
- ✅ Seul le créateur peut modifier/supprimer sa séance
- ✅ Le fichier `.env` ne doit JAMAIS être partagé sur GitHub

---

## 📚 Technologies Utilisées

- **Backend :** Node.js, Express.js, PostgreSQL, JWT, bcrypt
- **Frontend :** React, TypeScript, Vite, SCSS
- **Base de données :** PostgreSQL

---

## 🆘 Besoin d'Aide ?

Vérifiez que :
1. ✅ PostgreSQL est bien démarré
2. ✅ Le mot de passe dans `.env` est correct
3. ✅ Les ports 5000 et 5173 sont libres
4. ✅ Node.js v18+ est installé
5. ✅ La base de données `event_db` existe

---

**Bon développement ! 🎬**
