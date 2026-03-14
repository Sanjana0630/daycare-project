# Daycare Discovery

A comprehensive MERN stack web application designed to streamline daycare center operations. It provides features for managing child attendance and progress, tracking staff records, generating reports, and facilitating parent communication.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)

## Features
- **Admin Dashboard**: A centralized view of daycare operations, including user management and system settings.
- **Authentication**: Secure login system with JWT-based authentication (e.g., Admin login).
- **Children Management**: Track child attendance, activity logs, and progress.
- **Staff Management**: Monitor staff attendance records and view historical data.
- **Parent Portal**: Allows parents to view daily highlights, activities, and important alerts regarding their child.
- **Analytics & Reporting**: Generate detailed progress statistics and insights with interactive graphs and tables (exportable to CSV/PDF).

## Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast

### Backend
- **Environment**: Node.js
- **Framework**: Express.js 5
- **Database**: MongoDB (via Mongoose 9)
- **Authentication**: JSON Web Token (JWT) & bcryptjs
- **Middleware**: CORS, dotenv

## Project Structure
```text
Daycare/
├── backend/       # Node.js + Express API server
│   ├── models/    # Mongoose schemas (e.g., Attendance, Activity)
│   ├── routes/    # API endpoints
│   ├── package.json
│   └── server.js  # Entry point
└── frontend/      # React client application
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Page views (Dashboard, Reports, etc.)
    │   └── ...
    ├── package.json
    └── vite.config.js
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### Installation

1. **Clone the project repository** (if you haven't already) and navigate to the project directory:
   ```bash
   cd Daycare
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory with your environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Setup the Frontend:**
   Open a new terminal window/tab:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   *The server will typically run on `http://localhost:5000`.*

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

## Available Scripts

### In the `backend` directory:
- `npm start`: Runs the Node server (`node server.js`).
- `npm run dev`: Runs the server with Nodemon for auto-reloading during development.

### In the `frontend` directory:
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production in the `dist` folder.
- `npm run lint`: Runs ESLint to check for code issues.
- `npm run preview`: Locally previews the production build.
