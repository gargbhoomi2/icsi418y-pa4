# ICSI 418Y PA3 — Project Management Application

## Overview

This project extends PA2 by adding project management features to a React application. Users can create projects, select project leads, view projects, and manage project memberships.

## Features

- User signup and login.
- Create projects with a name, description, status, and project lead.
- View projects and their project lead's name and username.
- Automatically add the project lead as a project member.
- Add and remove project members.
- Prevent duplicate memberships.
- Prevent removal of the project lead.
- Store project and membership information in MongoDB Atlas.

## Technologies Used

- React
- Vite
- Node.js
- Express
- MongoDB Atlas

## Prerequisites

Install the following before running the application:

- Node.js and npm
- A MongoDB Atlas account and database connection

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/gargbhoomi2/icsi418y-pa3.git
cd icsi418y-pa3
```

### 2. Configure the backend

Open a terminal:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder. Add the environment variables required by `server.js`, using your own MongoDB connection string and database configuration.

**Do not commit your `.env` file or share database credentials.**

### 3. Start the backend

From the `server` folder, run:

```bash
node server.js
```

The backend runs on port 9000.

### 4. Configure and start the frontend

Open a second terminal from the project root:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

http://localhost:5173/

Keep both terminals running while using the application.

## Database Collections

The application uses the `login_signup` database in MongoDB Atlas.

- `users`: Stores registered users.
- `Projects`: Stores project information, including the project lead's ObjectId.
- `ProjectMemberships`: Stores the project and user ObjectId references for each membership.

## Validation

The backend validates project and membership requests, checks that referenced users and projects exist, prevents duplicate memberships, and prevents removing a project's lead.

## Repository

https://github.com/gargbhoomi2/icsi418y-pa3