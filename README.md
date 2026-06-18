# Event Ticket Booking System (MERN Stack)

This is a full-stack event ticket booking application built using the MERN stack (MongoDB, Express, React, Node.js) with a focus on seat reservation and booking confirmation.

## Features
*   **User Authentication**: JWT-based authentication for registering and logging in.
*   **Seat Reservation (Concurrency Controlled)**: Users can reserve available seats. The backend uses atomic MongoDB operations (`updateMany`) to prevent double-booking if multiple users try to reserve the same seat simultaneously.
*   **Reservation Timer**: A 10-minute countdown timer on the frontend.
*   **Automatic Expiration**: Expired reservations are automatically cleaned up, and seats revert to "available".
*   **Premium Design**: A highly polished, modern UI with glassmorphism, dark themes, and smooth animations using Vanilla CSS.

## Prerequisites
*   Node.js installed
*   MongoDB installed and running locally on `mongodb://127.0.0.1:27017`

## Getting Started

### 1. Database Setup & Seeding
Ensure MongoDB is running locally. Then, navigate to the backend directory and seed the database with initial events and seats:

```bash
cd backend
npm install
node seed.js
```

### 2. Running the Backend
In the `backend` directory, start the Express server:

```bash
npm run dev
# or
node server.js
```
The server will run on `http://localhost:5000`.

### 3. Running the Frontend
In a new terminal, navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## Design Decisions
*   **Preventing Double Booking**: We rely on MongoDB's atomic document updates. When reserving seats, we query for `status: 'available'`. If the modified count matches the requested seats, the reservation succeeds. If not, the transaction is safely aborted.
*   **Expiration Strategy**: Instead of a complex cron job, the `/api/events/:id` endpoint dynamically evaluates and cleans up expired reservations whenever a user loads the seat map.
*   **Styling**: Pure Vanilla CSS was used to adhere to constraints while delivering a premium user experience (using CSS variables, glassmorphism utilities, and flex/grid layouts).
