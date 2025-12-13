 # Drago Frontend

This is the **frontend repository** for **Drago – AI-Powered Educational Platform for Dyslexia Support**.  
The project is built with **React + Vite**.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Drago-project/drago-frontend.git
cd drago-frontend
```

### 2. Checkout the `dev` branch
All development should be done on the `dev` branch, **not on** `main`.

```bash
git checkout dev
```

### 3. Install dependencies
```bash
npm install
npm i axios
npm i lottie-react
npm i confetti
```

### 4. Run the project locally
```bash
npm run dev
```

Then open the link shown in the terminal (usually `http://localhost:5173`).

---

## 🌿 Git Workflow

### 1. Always **update your local** `dev` branch before starting work:
```bash
git checkout dev
git pull origin dev
```

### 2. Create a new branch for your name/task from `dev`:
```bash
git checkout -b feature/your-task-name
```

### 3. Work on your changes, then stage & commit:
```bash
git add .
git commit -m "Add: description of your change"
```

### 4. Push your branch to GitHub:
```bash
git push origin feature/your-task-name
```

### 5. Open a **Pull Request (PR)** on GitHub to merge into `dev`.

⚠️ **Do NOT push directly to** `main` or `dev`. Always create a feature branch and merge via PR.

⚠️ IMPORTANT RULES:

Do NOT push directly to main - Only the team leader can merge to main  

Do NOT push directly to dev - Always create a feature branch and merge via PR

All PRs must be reviewed and approved before merging



---

## 📂 Project Structure

```
drago-frontend/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images, icons, etc.
│   ├── components/  # Reusable UI components
│   ├── pages/       # Pages (Home, Dashboard, etc.)
│   ├── hooks/       # Custom React hooks
│   ├── styles/      # CSS
│   └── main.jsx     # App entry point
├── package.json
└── vite.config.js
```

---

## ✅ Contribution Rules

* Use **clear commit messages** (e.g., `Fix: login form validation`).
* Pull from `dev` before creating a new branch.
* Keep code clean and consistent (follow project's ESLint/Prettier setup).
* Review your PR before assigning a reviewer.
* Resolve merge conflicts locally before pushing.

---

## 📌 Notes

* `main` branch → stable, production-ready code only.
* `dev` branch → main development branch.
* `feature/*` branches → for individual tasks/features.

---
