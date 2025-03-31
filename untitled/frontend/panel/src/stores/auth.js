import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { auth } from '../main'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isAuthenticated = () => !!user.value
  
  const clearError = () => {
    error.value = null
  }
  
  const initializeAuth = () => {
    return new Promise((resolve, reject) => {
      let unsubscribe

      unsubscribe = onAuthStateChanged(
        auth,
        (userData) => {
          user.value = userData
          loading.value = false
          unsubscribe()
          resolve(userData)
        },
        (err) => {
          error.value = err.message
          loading.value = false
          unsubscribe()
          reject(err)
        }
      )
    })
  }
  
  const signIn = async (email, password) => {
    clearError()
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      user.value = userCredential.user
      return userCredential.user
    } catch (err) {
      console.error('Sign in error:', err)
      
      if (err.code === 'auth/invalid-credential') {
        error.value = 'Invalid email or password'
      } else if (err.code === 'auth/user-disabled') {
        error.value = 'This account has been disabled'
      } else if (err.code === 'auth/user-not-found') {
        error.value = 'User not found'
      } else if (err.code === 'auth/wrong-password') {
        error.value = 'Wrong password'
      } else {
        error.value = err.message || 'Login failed'
      }
      
      throw new Error(error.value)
    }
  }
  
  const signUp = async (email, password) => {
    clearError()
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      user.value = userCredential.user
      return userCredential.user
    } catch (err) {
      console.error('Sign up error:', err)
      
      if (err.code === 'auth/email-already-in-use') {
        error.value = 'Email address is already in use'
      } else if (err.code === 'auth/invalid-email') {
        error.value = 'Invalid email address'
      } else if (err.code === 'auth/weak-password') {
        error.value = 'Password is too weak'
      } else if (err.code === 'auth/operation-not-allowed') {
        error.value = 'Email/password accounts are not enabled'
      } else {
        error.value = err.message || 'Registration failed'
      }
      
      throw new Error(error.value)
    }
  }
  
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      user.value = null
    } catch (err) {
      console.error('Sign out error:', err)
      error.value = err.message || 'Failed to sign out'
      throw new Error(error.value)
    }
  }
  
  return {
    user,
    loading,
    error,
    isAuthenticated,
    clearError,
    initializeAuth,
    signIn,
    signUp,
    signOut
  }
}) 