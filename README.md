# Legal Manager

A web application designed for law firm management. Developed as the final integrated project for the Programming III course at Universidad Tecnológica Nacional (UTN - FRRO). The project was successfully defended before a panel and awarded the highest grade of 10/10.

## Tech Stack

- **Frontend:** React 19 + Vite, React Router, Bootstrap 5
- **Backend:** Node.js + Express 5, Sequelize, SQLite

## Features

- JWT Authentication with 3 roles: `sysadmin` (system administrator), `abogado` (lawyer), and `cliente` (client)
- CRUD operations for users, legal cases, and appointments
- Interactive calendar for scheduling appointments
- Light and dark theme toggle

## Video Demos

Here you can find the walkthrough videos showing the system's workflow for each user role (recorded at 1.5x speed):

### ⚖️ Lawyer Role (Appointments & Cases)
*Shows how a lawyer can view their calendar, manage appointments, and track legal cases.*
<video src="./assets/lawyer_view.mp4" controls width="100%"></video>

### 👥 Client Role (Portal & Appointment Tracking)
*Shows the client view, their active cases, and scheduling.*
<video src="./assets/client_view.mp4" controls width="100%"></video>

### ⚙️ Admin Role (User & Role Management)
*Shows user management and role assignment under the system administrator account.*
<video src="./assets/admin_view.mp4" controls width="100%"></video>

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher

## Installation

### Backend
```bash
cd api
cp .env.example .env   # then fill in the required values
npm install
npm run dev             # runs on the port defined in .env
```

#### Environment Variables

Copy `.env.example` to `.env` inside the `api/` folder and set the following values:

| Variable | Description |
| :--- | :--- |
| `PORT` | Port the API server listens on (e.g. `3000`) |
| `DB_DIALECT` | Database dialect used by Sequelize (e.g. `sqlite`) |
| `DB_STORAGE` | Path to the SQLite database file (e.g. `gestor_expedientes.db`) |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens |

### Frontend
```bash
cd client
npm install
npm run dev             # runs on http://localhost:5173
```

## Team Members

- Agustín Angelini
- Franco Cuscianna
- Thiago Cuscianna
