# Mobile Config Management System - Backend

This project contains a REST API for managing configuration files for mobile applications.

## Features

- Authentication with Firebase Auth
- Configuration storage in Firestore database
- API token validation for mobile clients
- Configuration versioning and history tracking
- Country-specific configuration support
- Comprehensive test coverage

## Technologies

- Node.js
- Express.js
- Firebase Admin SDK
- Firestore Database
- Firebase Auth
- Jest for testing

## Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Environment Variables

Define the following environment variables in your `.env` file:

```
# Server
PORT=3000
NODE_ENV=development

# API
API_TOKEN=your_predefined_api_token_here

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

## Firebase Configuration

1. Create a new project in [Firebase Console](https://console.firebase.google.com/)
2. Create a Service Account from project settings and download the private key
3. Add `project_id`, `private_key`, and `client_email` values from the downloaded JSON to your `.env` file

## API Endpoints

### Authentication

- `GET /api/auth/validate`: Validate Firebase ID token (Header: `Authorization: Bearer <token>`)

### Configuration Management (Admin Panel)

- `GET /api/config`: Get all configurations
- `GET /api/config/:name`: Get specific configuration
- `POST /api/config/:name`: Create or update configuration
- `DELETE /api/config/:name`: Delete configuration
- `GET /api/config/json`: Get specific configuration as JSON, for country-specific configuration, append `?country=XX` (country code).

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Middleware functions
├── routes/         # API routes
├── services/      # Services (Firestore, Firebase)
├── utils/         # Helper functions
└── server.js      # Main application file
```

## Testing

The project includes comprehensive test coverage for:
- Controllers
- Services
- Middleware
- Route handlers

Run tests using:
```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Heroku Deployment

```bash
# Heroku CLI must be installed
heroku login
heroku create your-app-name
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Set environment variables
heroku config:set FIREBASE_PROJECT_ID=your-firebase-project-id
heroku config:set FIREBASE_PRIVATE_KEY="your-firebase-private-key"
heroku config:set FIREBASE_CLIENT_EMAIL=your-firebase-client-email
heroku config:set API_TOKEN=your-predefined-api-token-here
```

### Google Cloud App Engine Deployment

```bash
# Google Cloud SDK must be installed
gcloud auth login
gcloud app deploy
```

Set environment variables in your `app.yaml` file or through Google Cloud Console. 