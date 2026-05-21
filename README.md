# ElectroForm — Frontend React

## Stack
- **React 18** + **Vite 5**
- **React Router v6** — navigation SPA
- **Zustand** — gestion d'état (auth, token JWT)
- **Axios** — appels API avec refresh token automatique
- **React Hot Toast** — notifications
- **CSS Modules** — styles scopés par composant

---

## Installation

### Prérequis
- Node.js 18+
- Le backend Django doit tourner sur `http://localhost:8000`

### Démarrage rapide
```bash
cd electroform_frontend
npm install
npm run dev
# → http://localhost:3000
```

### Build production
```bash
npm run build
# Les fichiers sont dans dist/
```

---

## Structure
```
src/
├── api/
│   └── client.js          # Axios + intercepteurs JWT + tous les services API
│
├── context/
│   └── authStore.js       # Zustand store (user, tokens, login/logout)
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx  # Sidebar + routing principal
│   │   └── AppLayout.module.css
│   └── ui/
│       ├── UI.jsx         # Card, Button, Badge, ProgressBar, Input, Spinner...
│       └── UI.module.css
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx        # Page de connexion
│   │   ├── InscriptionPage.jsx  # Création de compte
│   │   └── ResetMDPPage.jsx     # Réinitialisation mot de passe
│   │
│   ├── stagiaire/
│   │   ├── DashboardPage.jsx    # Vue d'ensemble + mes formations
│   │   ├── FormationsPage.jsx   # Catalogue + inscription
│   │   ├── CoursPage.jsx        # Lecteur de cours + progression
│   │   ├── QuizPage.jsx         # Quiz interactif + timer + correction
│   │   ├── PaiementPage.jsx     # Formulaire CMI + redirection
│   │   ├── PaiementSucces.jsx   # Retour succès CMI
│   │   ├── PaiementEchec.jsx    # Retour échec CMI
│   │   ├── CertificatsPage.jsx  # Mes certificats + téléchargement PDF
│   │   └── ProfilPage.jsx       # Informations + changement MDP
│   │
│   └── admin/
│       └── AdminDashboard.jsx   # KPIs + inscriptions + alertes CMI
│
├── App.jsx                # Router + routes protégées
├── main.jsx               # Point d'entrée
└── index.css              # Variables CSS globales
```

---

## Routes

| Route | Accès | Description |
|-------|-------|-------------|
| `/login` | Public | Connexion |
| `/inscription` | Public | Créer un compte |
| `/reset-mdp` | Public | Réinitialiser le MDP |
| `/payment/success` | Public | Retour CMI succès |
| `/payment/fail` | Public | Retour CMI échec |
| `/dashboard` | Stagiaire | Tableau de bord |
| `/formations` | Stagiaire | Catalogue des formations |
| `/cours/:inscriptionId` | Stagiaire | Lecteur de cours |
| `/quiz/:inscriptionId/:quizId` | Stagiaire | Quiz |
| `/paiement/:inscriptionId` | Stagiaire | Paiement CMI |
| `/certificats` | Stagiaire | Mes certificats |
| `/profil` | Stagiaire | Mon profil |
| `/admin` | Admin | Dashboard admin |

---

## Fonctionnalités clés

### Authentification JWT
- Connexion via `POST /api/auth/login/`
- Tokens stockés dans `localStorage` (Zustand persist)
- Refresh automatique du token access via intercepteur Axios
- Redirection vers `/login` si session expirée

### Flux paiement CMI
1. Stagiaire clique "Payer maintenant"
2. React appelle `POST /api/paiements/initier/`
3. Django génère les paramètres CMI + HASH
4. React soumet un formulaire HTML caché vers `CMI_BASE_URL`
5. CMI redirige vers `/payment/success` ou `/payment/fail`

### Progression des cours
- Chaque contenu consulté peut être marqué "terminé"
- Appel `POST /api/inscriptions/:id/progression/marquer/`
- La progression globale est recalculée automatiquement côté Django

---

## Variables d'environnement
Aucune variable `.env` nécessaire pour le développement local.
Le proxy Vite redirige `/api/*` vers `http://localhost:8000`.

Pour la production, configurez `VITE_API_URL` dans un `.env.production`.
