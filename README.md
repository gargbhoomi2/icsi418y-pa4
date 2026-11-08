# ICSI 418Y – PA4: User Stories and Project Backlog

## Project Description

This project is a web-based Project Management Application. It allows users to create accounts, log in, create projects, manage project members, and manage user stories.

For PA4, I added the User Stories and Project Backlog features to the existing application.

## Technologies Used

- **Frontend:** React and JavaScript
- **Backend:** Node.js and Express
- **Database:** MongoDB
- **Development Tools:** VS Code, Git, and GitHub

## Main Features

### 1. User Signup and Login
- Users can create an account.
- Existing users can log in.
- The application checks usernames and login information.

### 2. Project Management
- Users can view existing projects.
- Projects contain a description, status, and project lead.
- Users can manage project memberships.

### 3. User Stories
- Users can create user stories for a selected project.
- Each story contains a title, description, priority, status, and assigned member.
- A new story automatically receives the status **To Do**.
- Stories can be assigned to project members or left unassigned.

### 4. Project Backlog
- Users can view all stories belonging to a selected project.
- The backlog displays the story title, description, priority, status, and assigned member.
- Users can edit and delete stories.

### 5. Story Assignment and Membership Rules
- Only current project members can be assigned to stories.
- A project lead cannot be removed.
- A project member cannot be removed while they are assigned to one or more stories in that project.
- Members can be removed after their story assignments are changed or removed.

### 6. Data Storage
- MongoDB stores user, project, membership, and user story information.
- Changes remain saved after refreshing the application.

## User Story Format

User stories follow this format:

**As a [type of user], I want [goal], so that [benefit].**

Each user story has:
- Title
- Description
- Priority: High, Medium, or Low
- Status: To Do, In Progress, or Done
- Assigned project member or Unassigned

## Project Structure

```text
icsi418y-pa4/
│
├── client/
│   └── src/
│       ├── App.jsx
│       ├── CreateStory.jsx
│       ├── ProjectBacklog.jsx
│       └── EditStory.jsx
│
├── server/
│   └── server.js
│
├── README.md
└── .gitignore
```

## How to Run the Application

### Requirements
- Node.js and npm
- MongoDB connection
- A code editor such as VS Code

### Step 1: Clone the Repository

```bash
git clone https://github.com/gargbhoomi2/icsi418y-pa4.git
cd icsi418y-pa4
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3: Start the Backend

```bash
npm start
```

The backend runs on port **9000**.

Make sure the MongoDB connection is configured correctly before starting the server.

### Step 4: Install Frontend Dependencies

Open a second terminal:

```bash
cd client
npm install
```

### Step 5: Start the Frontend

```bash
npm run dev
```

Open the local URL displayed in the terminal. For example:

```text
http://localhost:5174/
```

## Testing

The following features were tested:

- Creating user stories in different projects.
- Using High, Medium, and Low priorities.
- Displaying To Do, In Progress, and Done statuses.
- Assigning stories to project members.
- Creating unassigned stories.
- Editing story information and status.
- Deleting stories.
- Checking that changes remain saved after refreshing.
- Preventing removal of the project lead.
- Allowing removal of an unassigned project member.
- Preventing removal of a member who is assigned to a story.

## Author

**Bhoomi Garg**

University at Albany  
ICSI 418Y – PA4