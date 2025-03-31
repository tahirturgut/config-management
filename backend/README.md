# Mobile Config Management System - Backend

This project contains a REST API for managing configuration files for mobile applications.

## Features

- Authentication with Firebase Auth
- Configuration storage in Firestore database
- API token validation for mobile clients
- Country-specific configuration support

## Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
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
├── services/       # Services (Firestore, Firebase)
├── utils/          # Helper functions
└── server.js       # Main application file
```

## Testing

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

### Google Cloud App Engine Deployment

```bash
# Google Cloud SDK must be installed
gcloud auth login
gcloud app deploy
```

Set environment variables in your `app.yaml` file.

## Google Cloud Deployment Steps

1. Install Google Cloud SDK
   - Download and install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
   - Initialize the SDK: `gcloud init`

2. Set up Google Cloud Project
   ```bash
   # Create a new project (if needed)
   gcloud projects create [PROJECT_ID] --name="[PROJECT_NAME]"
   
   # Set the project
   gcloud config set project [PROJECT_ID]
   
   # Enable required APIs
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable cloudrun.googleapis.com
   ```

3. Configure Firebase
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase in the project
   firebase init
   ```

4. Set up Environment Variables
   ```bash
   # Create a .env file with required variables
   cp .env.example .env
   
   # Edit .env with your values
   ```

5. Deploy to Google Cloud Run
   ```bash
   # Build the container
   gcloud builds submit --tag gcr.io/[PROJECT_ID]/backend
   
   # Deploy to Cloud Run
   gcloud run deploy backend \
     --image gcr.io/[PROJECT_ID]/backend \
     --platform managed \
     --region [REGION] \
     --allow-unauthenticated \
     --set-env-vars="[ENV_VARS]"
   ```

6. Configure Domain and SSL
   ```bash
   # Map custom domain
   gcloud run domain-mappings create \
     --service backend \
     --domain [YOUR_DOMAIN] \
     --platform managed \
     --region [REGION]
   ```

7. Set up Monitoring
   ```bash
   # Enable Cloud Monitoring
   gcloud services enable monitoring.googleapis.com
   
   # Set up logging
   gcloud services enable logging.googleapis.com
   ```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
