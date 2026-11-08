# ICSI 418Y PA3 — Project Management Application

## Overview

This application extends the existing login and signup application with project creation and project membership management. Registered users can create projects, select a project lead, view projects, and manage project members.

## Features

- User signup and login.
- Create projects with a name, description, status, and project lead.
- View all created projects and their project leads.
- View project members.
- Add registered users to projects.
- Allow users to participate in multiple projects.
- Prevent duplicate membership in the same project.
- Remove regular project members.
- Prevent removing the project lead.
- Display success and error messages for operations.

## Technologies Used

- React
- Vite
- Node.js
- Express
- MongoDB Atlas
- MongoDB ObjectIds

## Prerequisites

- Node.js and npm
- A MongoDB Atlas account and database connection string

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/gargbhoomi2/icsi418y-pa3.git
cd icsi418y-pa3
```

### 2. Set up the backend

Open a terminal in the project folder and run:

```bash
cd server
npm install
```

Create a file named `.env` inside the `server` folder. Add your MongoDB connection string:

```env
MONGO_URI=your_mongodb_connection_string
```

Replace the example value with your own MongoDB Atlas connection string. Do not commit your `.env` file or share database credentials.

Start the backend:

```bash
node server.js
```

The Express server runs on port 9000.

### 3. Set up the frontend

Open a **second terminal** in the project folder and run:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

http://localhost:5173/

Keep both terminals running while using the application.

## Database Design

The application uses MongoDB collections to store users, projects, and project memberships.

### Users

Stores registered user information used for login and project membership.

### Projects

Stores project information, including the project name, description, status, and `project_lead_id`. The project lead references a registered user through a MongoDB ObjectId.

### ProjectMemberships

Stores the relationship between users and projects using `project_id` and `user_id` ObjectIds. A unique compound index on these fields prevents the same user from being added to the same project more than once.

## Validation and Error Handling

The backend validates required project information and checks that referenced users and projects exist. It prevents duplicate memberships, returns an error when a duplicate member is added, and prevents the project lead from being removed as a regular member.

## GitHub Repository

https://github.com/gargbhoomi2/icsi418y-pa3
