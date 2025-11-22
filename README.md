# 🏥 Système de Gestion de Clinique Médicale

> Une plateforme complète et moderne pour la gestion des cliniques médicales, développée avec une architecture microservices.

## 📋 Description du Projet

Ce projet est une application web full-stack conçue pour moderniser et faciliter la gestion quotidienne d'une clinique médicale. Il offre une solution complète pour gérer les patients, les rendez-vous, les ordonnances et l'inventaire des médicaments.

### 🎯 Objectifs

- Digitaliser les processus de gestion de la clinique
- Améliorer l'expérience patient avec une interface moderne
- Faciliter la coordination entre les différents services médicaux
- Assurer la sécurité et la confidentialité des données médicales

## 🏗️ Architecture du Projet

Le projet est construit avec une **architecture microservices** pour assurer:
- ✅ **Scalabilité** - Chaque service peut évoluer indépendamment
- ✅ **Maintenabilité** - Code modulaire et facile à maintenir
- ✅ **Résilience** - L'échec d'un service n'affecte pas les autres
- ✅ **Flexibilité** - Technologies adaptées à chaque service

### 🔧 Stack Technique

#### Frontend
- **React.js** - Framework JavaScript moderne
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Bibliothèque d'icônes
- **React Router** - Navigation côté client

#### Backend
- **Flask** (Python) - Framework web minimaliste et puissant
- **SQLite** - Base de données pour le développement
- **PostgreSQL** - Base de données pour la production
- **JWT** - Authentification sécurisée
- **Docker** - Containerisation des services

## 🧩 Architecture Microservices

Le backend est organisé en **6 microservices indépendants**:

### 1️⃣ Service d'Authentification (`auth-service`)
- **Port**: 5001
- **Responsabilités**:
  - Inscription et connexion des utilisateurs
  - Gestion des sessions JWT
  - Contrôle d'accès et autorisations
- **Base de données**: `auth.db`

### 2️⃣ Service Patients (`patient-service`)
- **Port**: 5002
- **Responsabilités**:
  - Gestion des dossiers patients
  - Informations médicales et historique
  - CRUD complet sur les patients
- **Base de données**: `patients.db`

### 3️⃣ Service Rendez-vous (`appointment-service`)
- **Port**: 5003
- **Responsabilités**:
  - Gestion du calendrier médical
  - Planification des consultations
  - Notifications de rendez-vous
- **Base de données**: `appointments.db`
- **Dépendances**: Communique avec `patient-service` et `doctor-service`

### 4️⃣ Service Ordonnances (`prescription-service`)
- **Port**: 5004
- **Responsabilités**:
  - Création et gestion des ordonnances
  - Association médicaments-patients
  - Historique des prescriptions
- **Base de données**: `prescriptions.db`
- **Dépendances**: Communique avec `patient-service`, `doctor-service` et `medicine-service`

### 5️⃣ Service Médicaments (`medicine-service`)
- **Port**: 5005
- **Responsabilités**:
  - Inventaire des médicaments
  - Gestion des stocks
  - Informations pharmaceutiques
- **Base de données**: `medicines.db`

### 6️⃣ Service Médecins (`doctor-service`)
- **Port**: 5006
- **Responsabilités**:
  - Gestion des profils médecins
  - Spécialités et qualifications
  - Disponibilités et horaires
  - Statistiques et performances
- **Base de données**: `doctors.db`

### 🗄️ Base de Données PostgreSQL (Production)
- **Port**: 5432
- Utilisée pour l'environnement de production
- Remplace SQLite pour plus de performances et de fiabilité

## 🐳 Communication entre Services

Les microservices communiquent via **HTTP REST API** sur un réseau Docker privé (`clinic-network`). Cette architecture permet:

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │
    ┌────┴────┐
    │  API    │
    │ Gateway │
    └────┬────┘
         │
    ┌────┴───────────────────────────────────────────┐
    │                                                │
┌───┴────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌────────┐
│  Auth  │  │ Patient │  │Appointmt │  │Prescrip  │  │Medicine │  │ Doctor │
│Service │  │ Service │  │ Service  │  │ Service  │  │Service  │  │Service │
│ :5001  │  │  :5002  │  │  :5003   │  │  :5004   │  │ :5005   │  │ :5006  │
└────────┘  └─────────┘  └──────────┘  └──────────┘  └─────────┘  └────────┘
```

## 🚀 Installation et Démarrage

### Prérequis
- Docker & Docker Compose
- Node.js 16+ (pour le frontend)
- Python 3.9+ (pour développement local)

### 1. Cloner le projet
```bash
git clone <repository-url>
cd clinic-management-system
```

### 2. Démarrer le Backend (Microservices)
```bash
cd backend
docker-compose up -d
```

Les services seront accessibles sur:
- Auth Service: http://localhost:5001
- Patient Service: http://localhost:5002
- Appointment Service: http://localhost:5003
- Prescription Service: http://localhost:5004
- Medicine Service: http://localhost:5005
- Doctor Service: http://localhost:5006

### 3. Démarrer le Frontend
```bash
cd frontend
npm install
npm start
```

L'application sera accessible sur: http://localhost:3000

## 📁 Structure du Projet

```
clinic-management-system/
├── backend/
│   ├── services/
│   │   ├── auth-service/
│   │   │   ├── app.py
│   │   │   ├── Dockerfile
│   │   │   └── requirements.txt
│   │   ├── patient-service/
│   │   ├── appointment-service/
│   │   ├── prescription-service/
│   │   ├── medicine-service/
│   │   └── doctor-service/
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🔐 Sécurité

- **JWT Authentication**: Tokens sécurisés pour l'authentification
- **Variables d'environnement**: Secrets stockés de manière sécurisée
- **CORS**: Configuration stricte des origines autorisées
- **Validation des données**: Validation côté backend et frontend

## 🌟 Fonctionnalités Principales

### Pour les Patients
- ✅ Prise de rendez-vous en ligne
- ✅ Consultation de l'historique médical
- ✅ Accès aux ordonnances
- ✅ Notifications par email/SMS

### Pour les Médecins
- ✅ Gestion du calendrier
- ✅ Dossiers patients centralisés
- ✅ Création d'ordonnances
- ✅ Statistiques et rapports

### Pour les Administrateurs
- ✅ Gestion des utilisateurs
- ✅ Inventaire des médicaments
- ✅ Rapports financiers
- ✅ Configuration du système

## 🛠️ Développement

### Variables d'environnement

Créer un fichier `.env` dans chaque service:

```env
DATABASE_URL=sqlite:///service.db
PORT=500X
JWT_SECRET=your_secret_key_here
```

### Tests

```bash
# Tests backend
cd backend/services/auth-service
python -m pytest

# Tests frontend
cd frontend
npm test
```

## 📊 Monitoring

Les services peuvent être monitorés via:
- Docker logs: `docker-compose logs -f [service-name]`
- Health checks: Endpoints `/health` sur chaque service
- Métriques: (À implémenter avec Prometheus/Grafana)

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request



**Note**: Ce projet est en développement actif. Certaines fonctionnalités peuvent être en cours d'implémentation.