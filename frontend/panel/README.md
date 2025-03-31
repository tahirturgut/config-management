
# Mobile Config Management System - Frontend

This project is the admin panel frontend for managing mobile application configurations. Built with Vue 3 and Vite.

## Features

- Modern and responsive UI
- Real-time configuration management
- Country-specific configuration support

## Project Setup

```bash
npm install

npm run dev

npm run build
```

## Testing

The project includes comprehensive test coverage for:
- Stores (Pinia)
- Components
- Views
- Utils

Run tests using:
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test path/to/test/file.spec.js
```

### Test Structure

Tests are organized in `__tests__` directories next to the files they test:

```
src/
├── components/
│   └── __tests__/
├── stores/
│   └── __tests__/
├── views/
│   └── __tests__/
└── utils/
    └── __tests__/
```

## Environment Variables

Edit the `.env` file in the project root and add:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_API_BASE_URL=your_url
```

## Deployment

### Google Cloud Deployment

To deploy your frontend on Google Cloud, follow these steps:

1. **Build the Project**:
   First, build the frontend for production.

   ```bash
   npm run build
   ```

   This will generate a `dist` folder containing your built assets.

2. **Prepare the Google Cloud Storage Bucket**:
   - Go to the Google Cloud Console.
   - Create a new bucket or use an existing one.
   - Ensure your bucket is publicly accessible for static content.

3. **Upload Build Files to Google Cloud Storage**:
   Use the `gsutil` command to upload your build files to Google Cloud Storage.

   ```bash
   gsutil -m cp -r dist/* gs://your-bucket-name/
   ```

4. **Set Up Google Cloud App Engine (Optional)**:
   If you'd prefer using Google Cloud App Engine instead of Cloud Storage for hosting, follow these steps:
   
   - Update the `app.yaml` file in your project root directory with the following configuration:

     ```yaml
     runtime: nodejs20

     env_variables:
       VITE_API_URL: "https://your-backend-url/api"
       VITE_FIREBASE_API_KEY: "your-firebase-api-key"
       VITE_FIREBASE_AUTH_DOMAIN: "your-auth-domain"
       VITE_FIREBASE_PROJECT_ID: "your-project-id"
       VITE_FIREBASE_STORAGE_BUCKET: "your-storage-bucket"
       VITE_FIREBASE_MESSAGING_SENDER_ID: "your-messaging-sender-id"
       VITE_FIREBASE_APP_ID: "your-app-id"
       VITE_FIREBASE_MEASUREMENT_ID: "your-measurement-id"

     handlers:
       - url: /(.*)
         static_files: dist/
         upload: dist/(.*)
         secure: always
     ```

   - Deploy the application using the `gcloud` CLI:

     ```bash
     gcloud app deploy
     ```

   This will deploy your frontend to Google Cloud App Engine.

6. **Access Your Application**:
   Once the deployment is successful, you will receive a URL from Google Cloud where your frontend is hosted.
