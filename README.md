# Do-Did Manager

### Project — Web Development 2025 (MDM - University of Coimbra)

**Final Project — Electron Desktop Application**

---

This repository contains the source code for the **Do-Did Manager**, a responsive desktop application developed using **Electron**, **Node.js**, and **MongoDB**. The goal of the application is to transform procrastination into productivity through intelligent task management.

The project was built using **HTML5**, **CSS3**, and **Vanilla JavaScript (ES6 Modules)**, adhering to strict requirements: no external libraries (besides Electron and MongoDB) and a custom-built Node.js server using native modules.

> **Note:** The application interface and user experience are designed entirely in **Portuguese**.

---
## Features (Assignment Requirements)

### Architecture & Backend
- **Single Page Application (SPA):** Fluid navigation without page reloads, injecting views dynamically into the DOM.
- **Native Node.js Server:** The backend is built using the native `http` module, without frameworks like Express.
- **Security:** User authentication (Login/Register) implemented with password encryption using Node's native `crypto` module.

### Task Management
- **Urgency Levels:** Tasks can be categorized by urgency (High, Medium, Low) or as "Recurrent".
- **Deadlines:** Visual indicators and countdowns for task deadlines.
- **Sub-tasks:** Ability to nest smaller to-do items within a main task.

### Responsive UX/UI
- **Dual View Modes:**
    - **Overview:** A grid layout displaying all categories.
    - **Focus Mode:** A split-screen view focusing on a specific category while maintaining navigation access.
- **Fully Responsive:** The layout adapts seamlessly between Desktop, Tablet, and Mobile views.
- **Aesthetic Rigor:** Custom CSS properties and smooth transitions for a modern look.

---

## Installation and Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Community Server)
- Git

### 1. Clone the Repository
```bash
git clone [https://github.com/Kilatoss/do-did-manager]
cd do-did-manager

```

### 2. Install Dependencies

```bash
npm install

```

---

## Database Configuration

The project uses **MongoDB**. Ensure the MongoDB service is running locally on the default port (`27017`).

### Initialize with Sample Data

To initialize the application with a default state, use the JSON files provided in the mongo directory (`do-did.users.json`, `do-did.categories.json`, `do-did.tasks.json`).

Run the following commands in your terminal (at the project root):

```bash
# Import Users
mongoimport --db do-did --collection user --file users.json --jsonArray

# Import Categories
mongoimport --db do-did --collection categories --file categories.json --jsonArray

# Import Tasks
mongoimport --db do-did --collection tasks --file tasks.json --jsonArray

```

> **Note:** The database `do-did` will be created automatically.

---

## Running the Application

To run the application, you must start both the Backend Server and the Electron Client simultaneously.

### Step 1: Start the Server (Backend)

Open a terminal and run:

```bash
node server.js

```

*The server will run at `http://localhost:3000`.*

### Step 2: Start Electron (Client)

Open a **new terminal** (keep the previous one running) and run:

```bash
npm start

```

---

## Student Contributions


| **Afonso Martins** | 2021218699 | 
• Backend (Native Node.js) 
• Authentication & Security 
• Database (MongoDB) 
• Electron Integration 
• UI Design and Modals 

---

## Technologies Used

* **Runtime:** Node.js
* **Framework:** Electron
* **Database:** MongoDB
* **Frontend:** HTML5, CSS3, JavaScript (ES6)

```

```