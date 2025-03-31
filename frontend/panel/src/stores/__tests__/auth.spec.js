import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { auth } from '../../main'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth'

const mockUnsubscribe = jest.fn()

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => mockUnsubscribe)
}))

jest.mock('../../main', () => ({
  auth: {}
}))

describe('Auth Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAuthStore()
    jest.clearAllMocks()
  })

  describe('initializeAuth', () => {
    it('should initialize auth state successfully', async () => {
      const mockUser = { email: 'test@example.com' }
      onAuthStateChanged.mockImplementation((auth, callback, errorCallback) => {
        setTimeout(() => callback(mockUser), 0);
        return mockUnsubscribe;
      });

      await store.initializeAuth()

      expect(store.user).toEqual(mockUser)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should handle initialization error', async () => {
      const error = new Error('Auth error')
      onAuthStateChanged.mockImplementation((auth, callback, errorCallback) => {
        setTimeout(() => errorCallback(new Error('Auth error')), 0);
        return mockUnsubscribe;
      });

      await expect(store.initializeAuth()).rejects.toThrow(error.message)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(error.message)
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = { email: 'test@example.com' }
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser })

      await store.signIn('test@example.com', 'password')

      expect(store.user).toEqual(mockUser)
      expect(store.error).toBeNull()
    })

    it('should handle invalid credentials', async () => {
      const error = { code: 'auth/invalid-credential' }
      signInWithEmailAndPassword.mockRejectedValue(error)

      await expect(store.signIn('test@example.com', 'wrong')).rejects.toThrow('Invalid email or password')
      expect(store.error).toBe('Invalid email or password')
    })

    it('should handle disabled account', async () => {
      const error = { code: 'auth/user-disabled' }
      signInWithEmailAndPassword.mockRejectedValue(error)

      await expect(store.signIn('test@example.com', 'password')).rejects.toThrow('This account has been disabled')
      expect(store.error).toBe('This account has been disabled')
    })
  })

  describe('signUp', () => {
    it('should create new user successfully', async () => {
      const mockUser = { email: 'test@example.com' }
      createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser })

      await store.signUp('test@example.com', 'password')

      expect(store.user).toEqual(mockUser)
      expect(store.error).toBeNull()
    })

    it('should handle existing email', async () => {
      const error = { code: 'auth/email-already-in-use' }
      createUserWithEmailAndPassword.mockRejectedValue(error)

      await expect(store.signUp('existing@example.com', 'password')).rejects.toThrow('Email address is already in use')
      expect(store.error).toBe('Email address is already in use')
    })

    it('should handle weak password', async () => {
      const error = { code: 'auth/weak-password' }
      createUserWithEmailAndPassword.mockRejectedValue(error)

      await expect(store.signUp('test@example.com', 'weak')).rejects.toThrow('Password is too weak')
      expect(store.error).toBe('Password is too weak')
    })
  })

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      store.user = { email: 'test@example.com' }
      firebaseSignOut.mockResolvedValue()

      await store.signOut()

      expect(store.user).toBeNull()
      expect(store.error).toBeNull()
    })

    it('should handle sign out error', async () => {
      const error = new Error('Sign out failed')
      firebaseSignOut.mockRejectedValue(error)

      await expect(store.signOut()).rejects.toThrow('Sign out failed')
      expect(store.error).toBe('Sign out failed')
    })
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      store.error = 'Some error'
      store.clearError()
      expect(store.error).toBeNull()
    })
  })
}) 