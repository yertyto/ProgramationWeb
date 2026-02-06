# Guide Complet d'Installation

Avant de commencer, installez ces logiciels dans l'ordre exact :

### 1️. Node.js 
- **Télécharger** : https://nodejs.org/
- Installer avec les paramètres par défaut
- **Vérifier après installation** :
```bash
node --version
npm --version
```

### 2️. PostgreSQL 
- **Télécharger** : https://www.postgresql.org/download/
- **Important pendant l'installation** :
  -  Notez votre mot de passe PostgreSQL 
  -  Gardez le port : **5432**
  -  Gardez le username : **postgres**
- **Vérifier après installation** :
```bash
psql --version
```

### 3️. Git
- **Télécharger** : https://git-scm.com/
- Installer avec les paramètres par défaut

---

## Suivez les étapes ligne par ligne
### Étape 1 : Cloner le Projet
Ouvrir un terminal et exécuter : 

git clone https://github.com/votre-utilisateur/Nantral-plateform-du-bled-main.git
cd Nantral-plateform-du-bled-main


### Étape 2 : Créer la Base de Données
#### A. Créer une base de données vide
Ouvrir un terminal et exécuter :

psql -U postgres
**→ Puis Entrez votre mot de passe PostgreSQL**


Vous arrivez au prompt `postgres=#`. Tapez :

```sql
CREATE DATABASE event_db;
\q
```

**Base de données créée !**
#### B. Créer les tables
Toujours dans le terminal :

cd event-backend
psql -U postgres -d event_db -f setup-final.sql
**→ Entrez votre mot de passe PostgreSQL**


### Étape 3 : Configurer le Backend
#### A. Vérifier le fichier .env

Ouvrir `event-backend/.env` avec **Notepad** ou **VS Code**
**Le contenu DOIT être :**

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=VOTRE_MOT_DE_PASSE_POSTGRESQL 
DB_NAME=event_db
PORT=5000
JWT_SECRET=dev_secret_change_me
NODE_ENV=development
```
**REMPLACEZ `VOTRE_MOT_DE_PASSE_POSTGRESQL` par votre vrai mot de passe**

**Exemple :**
```env
DB_PASSWORD=MonMotdepasse123
```
Sauvegarder (Ctrl+S) et fermer le fichier


#### B. Installer les dépendances
Terminal dans le dossier `event-backend` :

npm install


### Étape 4 : Configurer le Frontend

Terminal dans le dossier `event-frontend` :

cd ../event-frontend
npm install


## Lancer l'Application

**Vous devez avoir 2 terminaux ouverts simultanément**

### Terminal 1 : Backend
Dans le dossier `event-backend` :

npm start

**Vous verrez :**
Server running on http://localhost:5000


### Terminal 2 : Frontend
Ouvrez un NOUVEAU terminal dans le dossier `event-frontend` :

npm run dev


**Vous verrez :**
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/

---

## 🌐 Accéder à l'Application

Ouvrez votre navigateur et allez à :
http://localhost:5173/

**Normalement l'app marche Youpiiii**

---
## Première Utilisation
1. **Créer un compte** : Cliquez sur "S'inscrire"
2. **Créer une séance** : Cliquez sur "+ Créer une Séance"
3. **Rejoindre une séance** : Cliquez "Rejoindre" sur un événement
4. **Modifier votre séance** : Cliquez sur le bouton ✎
5. **Voir votre profil** : Cliquez sur votre username
---



## Les Problèmes Courants rencontrés !!!!! : 

### "Failed to fetch" (Erreur d'inscription/connexion)
**Cause** : Le backend n'est pas démarré

**Solution** :
- Vérifiez que **Terminal 1 affiche** : `Server running on http://localhost:5000`
- Si non, lancez `npm start` dans `event-backend`

---

### "Cannot connect to database"
**Cause** : PostgreSQL n'est pas démarré ou mot de passe incorrect
**Solution Windows** :
```bash
# Ouvrir Services (services.msc)
# Chercher "postgresql" 
# Clic droit > Démarrer
```

**Solution Mac** :
```bash
brew services start postgresql
```

**Solution Linux** :
```bash
sudo systemctl start postgresql
```

---

### "password authentication failed"
**Cause** : Mauvais mot de passe dans `.env`
**Solution** :
1. Vérifiez votre mot de passe PostgreSQL original
2. Modifiez `event-backend/.env`
3. Relancez `npm start`

---

### "database "event_db" does not exist"
**Cause** : Vous avez oublié l'étape 2A ou 2B
**Solution** :
```bash
psql -U postgres
CREATE DATABASE event_db;
\q
cd event-backend
psql -U postgres -d event_db -f setup-final.sql
```

---

### "Port 5000 already in use"
**Cause** : Un autre programme utilise le port 5000
**Solution Windows** :
```bash
netstat -ano | findstr :5000
taskkill /PID <numero> /F
```

**Solution Mac/Linux** :
```bash
lsof -i :5000
kill -9 <numero>
```

---

### "Port 5173 already in use"
**Cause** : Un autre programme utilise le port 5173
**Solution Windows** :
```bash
netstat -ano | findstr :5173
taskkill /PID <numero> /F
```

**Solution Mac/Linux** :
```bash
lsof -i :5173
kill -9 <numero>
```

---

### "Cannot find module"

**Cause** : Dépendances non installées

**Solution** :
```bash
cd event-backend
rm -rf node_modules
npm install

cd ../event-frontend
rm -rf node_modules
npm install
```

