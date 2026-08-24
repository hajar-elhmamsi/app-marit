# NAVIOS — Système de Gestion des Escales Maritimes (Port de Casablanca)

Plateforme web d'administration portuaire et de gestion des escales maritimes pour le **Port de Casablanca (UN/LOCODE: MACAS)** sous l'égide de l'**Agence Nationale des Ports (ANP)**.

---

## 🚀 Fonctionnalités Clés

* **Tableau de Bord & Supervision (MACAS)** : Suivi en temps réel des navires à quai, arrivées prévues en rade et typologie de trafic.
* **Gestion des Escales Maritimes** : Workflow complet de déclaration (ETA/ETD), accostage effectif (ATA), clôture d'appareillage (ATD) et annulation motivée.
* **Demandes d'Accès Portuaire (DAP ANP)** : Guichet unique dématérialisé pour l'instruction, l'autorisation ou le rejet technique des demandes d'accès aux quais.
* **Sécurité & Contrôle d'Accès Granulaire (RBAC)** :
  * Profils métier adaptés : *Consignataire Agréé*, *Capitainerie VTS*, *Direction Régionale ANP*.
  * Matrice d'habilitations et personnalisation des privilèges par utilisateur.
* **Registre de la Flotte & Infrastructures** : Gestion des navires (IMO), autorités portuaires et postes à quai (TC3 Marsa Maroc, TC2 Somaport, Roulier, Phosphates, Pétrole).
* **Traçabilité & Journal d'Audit** : Historique exhaustif des actions, modifications de statut et adresses IP.

---

## 🛠️ Stack Technique

* **Frontend** : React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router.
* **Backend** : Laravel 11 (PHP 8.2), API RESTful, Laravel Sanctum, Form Requests, Policies.
* **Base de données** : MySQL.

---

## 📦 Installation & Lancement Local

### 1. Cloner le dépôt
```bash
git clone https://github.com/hajar-elhmamsi/app-marit.git
cd app-marit
```

### 2. Démarrer le Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
> Le portail est accessible sur `http://localhost:5173`.

### 3. Démarrer le Backend (Laravel / Node API)
```bash
cd backend
npm install
npm start
```

---

## 👤 Auteure unique & Licence

* **Auteure unique du site** : Hajar Elhmamsi
* **GitHub** : [@hajar-elhmamsi](https://github.com/hajar-elhmamsi)
* **Licence** : Propriétaire — Hajar Elhmamsi
