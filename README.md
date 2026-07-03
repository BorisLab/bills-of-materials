# Bill of Materials (BOM) App

Cette application web permet d'importer, de traiter et de gérer des nomenclatures de composants électroniques (Bill of Materials - BOM). Elle extrait automatiquement les composants à partir de documents importés (images ou pdf) grâce à un traitement OCR, permet la validation des données, génère des devis tarifés et intègre un flux de validation pour les équipes commerciales et administratives.

## Architecture technique

L'application repose sur une architecture découplée contenant les briques suivantes :
* Frontend : Next.js (TypeScript, Tailwind CSS, Jest, ESLint)
* Backend : FastAPI (Python, SQLAlchemy, PostgreSQL, Pytest, Flake8)
* Base de données : PostgreSQL

## Fonctionnalités principales

L'accès aux fonctionnalités est segmenté selon 3 rôles d'utilisateurs distincts :

* Client : 
  * Importation de nomenclatures sous forme de fichiers PDF ou image.
  * Analyse automatique par OCR pour extraire la liste des composants, descriptions et quantités demandées.
  * Tableau interactif pour vérifier, modifier et valider les informations extraites.
  * Génération automatique d'un devis chiffré basé sur le catalogue de prix.
  * Exportation du devis au format PDF.

* Commercial :
  * Espace de suivi de tous les devis générés par les clients.
  * Actions de validation ou de rejet des devis en attente.

* Administrateur :
  * Espace de gestion du catalogue de composants.
  * Mise à jour et enregistrement des prix unitaires de chaque référence de composant.

## Installation et démarrage

### Prérequis
* Docker et Docker Compose
* Clé d'API OCR Space (https://ocr.space/)

### Lancement avec Docker

1. Créez un fichier `.env` à la racine ou exportez vos variables d'environnement, notamment la clé OCR :
   ```bash
   OCR_SPACE_API_KEY=votre_cle_api
   ```

2. Lancez l'ensemble des services via Docker Compose :
   ```bash
   docker-compose up --build
   ```

Le frontend est accessible sur `http://localhost:3000` et l'API sur `http://localhost:8000`.

### Lancement en mode développement local (sans Docker)

#### Backend

1. Accédez au dossier backend et configurez un environnement virtuel Python :
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate # Sur Windows: venv\Scripts\activate
   ```

2. Installez les dépendances :
   ```bash
   pip install -r requirements.txt
   ```

3. Configurez vos variables d'environnement dans un fichier `.env` ou dans votre terminal :
   ```bash
   DATABASE_URL=sqlite+aiosqlite:///:memory:
   SECRET_KEY=votre_secret_jwt
   OCR_SPACE_API_KEY=votre_cle_api
   ```

4. Lancez le serveur de développement Uvicorn :
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend

1. Accédez à la racine du projet et installez les dépendances Node :
   ```bash
   npm install
   ```

2. Lancez le serveur de développement Next.js :
   ```bash
   npm run dev
   ```

## Tests et Qualité du code

Le projet intègre un pipeline de CI (GitHub Actions) qui valide chaque push et pull request sur les branches `main` et `dev`.

### Commandes Frontend
* Exécuter le linter (ESLint) : `npm run lint`
* Exécuter les tests unitaires (Jest) : `npm test`

### Commandes Backend
* Exécuter le linter (Flake8) : `flake8 app tests`
* Exécuter les tests unitaires (Pytest) : `pytest tests/`
