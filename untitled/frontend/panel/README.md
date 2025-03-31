# Mobile Config Management System - Frontend

This project is the admin panel frontend for managing mobile application configurations. Built with Vue 3 and Vite.

## Features

- Modern and responsive UI
- Real-time configuration management
- Country-specific configuration support
- Firebase authentication
- Comprehensive test coverage

## Technologies

- Vue 3
- Vite
- Pinia for state management
- PrimeVue for UI components
- Firebase Auth
- Jest for testing
- Vue Test Utils

## Project Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
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

Create a `.env` file in the project root and add:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_API_BASE_URL=http://localhost:3000/api
```

## Development

### Recommended IDE Setup
- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### Type Support For `.vue` Imports in IDE
- See [Vue's IDE Support Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support)

## Building for Production

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

## Deployment

### Static Hosting (e.g., Firebase Hosting)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init hosting

# Deploy to Firebase
firebase deploy
```

### Docker Deployment

```bash
# Build Docker image
docker build -t config-panel .

# Run Docker container
docker run -p 8080:80 config-panel
```
