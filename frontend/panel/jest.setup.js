import '@testing-library/jest-dom';
import * as Vue from 'vue';
import * as VueCompilerDOM from '@vue/compiler-dom';
import * as VueServerRenderer from '@vue/server-renderer';

global.VueCompilerDOM = VueCompilerDOM;
global.VueServerRenderer = VueServerRenderer;
global.Vue = Vue;

jest.mock('primevue/usetoast', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
    removeGroup: jest.fn(),
    removeAllGroups: jest.fn()
  }))
}));

jest.mock('primevue/useconfirm', () => ({
  useConfirm: jest.fn(() => ({
    require: jest.fn()
  }))
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

window.__VITE_API_URL = 'http://localhost:0/api';

window.__VITE_FIREBASE_API_KEY = 'test-api-key';
window.__VITE_FIREBASE_AUTH_DOMAIN = 'test-auth-domain';
window.__VITE_FIREBASE_PROJECT_ID = 'test-project-id';
window.__VITE_FIREBASE_STORAGE_BUCKET = 'test-storage-bucket';
window.__VITE_FIREBASE_MESSAGING_SENDER_ID = 'test-messaging-sender-id';
window.__VITE_FIREBASE_APP_ID = 'test-app-id';

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

jest.mock('vue-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn()
  }))
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));