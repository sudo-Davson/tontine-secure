# 🤝 Guide de Contribution - TontineSecure

Bienvenue dans l'équipe ! Ce guide explique comment travailler sur le projet.

---

## 📋 Table des matières

1. [Installation](#installation)
2. [Workflow Git](#workflow-git)
3. [Conventions de code](#conventions-de-code)
4. [État du projet](#état-du-projet)
5. [Communication](#communication)

---

## 🚀 Installation

### Prérequis
- Node.js 20+
- Git
- VS Code

### Étapes

```bash
# 1. Cloner le projet
git clone https://github.com/sudo-Davson/tontine-secure.git
cd tontine-secure

# 2. Installer les dépendances
npm install

# 3. Démarrer le serveur
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## 🔄 Workflow Git

### ⚠️ Règle n°1 : Ne JAMAIS travailler sur `main`

### Créer une branche

```bash
git checkout -b feature/nom-de-la-tache
```

### Travailler

```bash
# Faire les modifications
git add .
git commit -m "feat(api): ajout de l'API liste des tontines"
git push origin feature/nom-de-la-tache
```

### Synchroniser chaque matin

```bash
git checkout main
git pull origin main
git checkout feature/nom-de-la-tache
git merge main
```

### Créer une Pull Request

1. Aller sur GitHub
2. Cliquer sur **Pull Requests** → **New Pull Request**
3. Choisir `feature/nom-de-la-tache` → `main`
4. Remplir la description
5. Assigner un reviewer
6. Cliquer sur **Create Pull Request**

### Convention de commits

Format : `type(scope): description`

| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage |
| `refactor` | Refactorisation |
| `test` | Tests |
| `chore` | Maintenance |

**Exemples :**
```
✅ feat(api): ajout de l'API liste des tontines
✅ fix(auth): correction du token JWT
✅ docs(readme): mise à jour du guide
❌ update
❌ fix
```

---

## 🎨 Conventions de code

### Nommage

```tsx
mon-composant.tsx          // Composants
mon-service.ts             // Services
route.ts                   // APIs
page.tsx                   // Pages
```

### Style Tailwind

```tsx
// ✅ Correct
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg">
    Cliquer
  </button>
</div>

// ❌ À éviter
<div className="bg-white">
  <button className="px-4 py-2">Cliquer</button>
</div>
```

### Responsive

```tsx
// Mobile first
<div className="flex flex-col sm:flex-row gap-2">
  <input className="w-full sm:flex-1" />
  <button className="w-full sm:w-auto">Envoyer</button>
</div>
```

---

## 📊 État du projet

### ✅ Ce qui est fait

**Pages (21) :** Accueil, Connexion, Inscription, KYC 1/2/3, Statut, Dashboard, Tontines, Créer, Détails, Cotisations, Portefeuille, Transactions, Notifications, Invitations, Rejoindre, Sécurité, Paramètres, Tarifs, Démo

**Services (8) :** AuthContext, ThemeContext, tontine-service, notification-service, frais-service, abonnement-service, frequence-service, invitation-service

**Fonctionnalités :** Mode sombre, Responsive, Protection routes, Modèle économique, Réputation, Biométrie, Notifications, Invitations

### ❌ Ce qui reste à faire

**Priorité 1 :**
- APIs Tontines (CRUD)
- APIs Cotisations
- APIs Membres
- APIs Transactions

**Priorité 2 :**
- Base de données (Prisma + PostgreSQL)
- Intégrations (Smile ID, Tmoney, Flooz)

**Priorité 3 :**
- Chat entre membres
- Export PDF/Excel
- Tests et déploiement

---

## 📞 Communication

### Point quotidien
Chaque matin à **9h** (15 min) :
- Hier : ce qui a été fait
- Aujourd'hui : ce qui va être fait
- Blocages : ce qui bloque

### Canaux
- **GitHub Issues** : Tâches
- **Pull Requests** : Revue de code
- **WhatsApp** : Questions rapides

### Règle des 30 minutes
Si tu es bloqué plus de **30 minutes**, demande de l'aide.

---

## ✅ Checklist avant Push

- [ ] Le serveur démarre sans erreur
- [ ] Les fonctionnalités marchent
- [ ] Le mode sombre fonctionne
- [ ] Le responsive est OK
- [ ] Pas d'erreur dans la console (F12)
- [ ] Message de commit clair
- [ ] Branche à jour avec main

---

**Bon courage ! 🚀**