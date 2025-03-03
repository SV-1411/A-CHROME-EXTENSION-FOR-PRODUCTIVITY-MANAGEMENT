# Productivity Tracking Chrome Extension (MERN Stack)

A Chrome extension that tracks website usage, blocks distractions, and generates reports.

Features

Tracks time spent on different websites

Blocks distracting sites

Generates reports on browsing habits

Syncs data across devices

Tech Stack

Frontend: React (Chrome Extension)

Backend: Node.js, Express, MongoDB

Setup

1. Clone the repository

git clone https://github.com/yourusername/productivity-tracker.git
cd productivity-tracker

2. Install dependencies

# Backend
cd backend
npm install

# Frontend
cd ../extension
npm install

3. Create a .env file

Backend (/backend/.env)

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Frontend (/extension/.env)

REACT_APP_API_URL=http://localhost:5000

4. Load the Chrome Extension

Go to chrome://extensions/

Enable Developer Mode

Click Load unpacked

Select the /extension folder


