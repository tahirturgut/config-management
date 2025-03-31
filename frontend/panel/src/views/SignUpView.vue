<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const isSubmitting = ref(false)

const storeError = computed(() => authStore.error)

const validateForm = () => {
  let isValid = true
  
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  
  if (!email.value) {
    emailError.value = 'Email address is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
    isValid = false
  }
  
  if (!password.value) {
    passwordError.value = 'Password is required'
    isValid = false
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    isValid = false
  }
  
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
    isValid = false
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    isValid = false
  }
  
  return isValid
}

const handleSignUp = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  authStore.clearError()
  
  try {
    await authStore.signUp(email.value, password.value)
    
    router.push('/')
    
  } catch (error) {
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="signup-container">
    <div class="signup-logo">
      <img src="@/assets/images/logo.svg" alt="Logo" />
    </div>
    
    <h1 class="signup-title">Create a new account</h1>
    
    <div class="signup-form-card">
      <form @submit.prevent="handleSignUp" class="p-fluid">
        <div class="field">
          <InputText 
            id="email"
            v-model="email"
            placeholder="E-mail address"
            :class="{ 'p-invalid': emailError }"
            aria-describedby="email-error"
          />
          <small v-if="emailError" id="email-error" class="error-text">{{ emailError }}</small>
        </div>
        
        <div class="field">
          <Password 
            id="password"
            v-model="password"
            placeholder="Password"
            :feedback="true"
            :class="{ 'p-invalid': passwordError }"
            aria-describedby="password-error"
            promptLabel="Choose a password"
            weakLabel="Too simple"
            mediumLabel="Average complexity"
            strongLabel="Complex password"
          />
          <small v-if="passwordError" id="password-error" class="error-text">{{ passwordError }}</small>
        </div>
        
        <div class="field">
          <Password 
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Confirm password"
            :feedback="false"
            :class="{ 'p-invalid': confirmPasswordError }"
            aria-describedby="confirm-password-error"
          />
          <small v-if="confirmPasswordError" id="confirm-password-error" class="error-text">{{ confirmPasswordError }}</small>
        </div>
        
        <div v-if="storeError" class="error-text">{{ storeError }}</div>
        
        <Button 
          type="submit"
          label="Create Account"
          class="signup-button mt-4"
          :loading="isSubmitting"
          style="background-color: #4361ee; border-color: #4361ee;"
        />
      </form>
      
      <div class="signin-link">
        <span>Already have an account?</span>
        <router-link to="/signin">Sign in</router-link>
      </div>
    </div>
    
    <div class="signup-footer">
      <p>Tahir Turgut © {{ new Date().getFullYear() }}</p>
    </div>
  </div>
</template>

<style>
.signup-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: var(--background-color);
}

.signup-logo {
  width: 180px;
  height: 180px;
  margin-bottom: 2rem;
}

.signup-logo img {
  width: 100%;
  height: 100%;
}

.signup-title {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 400;
  color: #8f95b2;
}

.signup-form-card {
  background-color: transparent;
  padding: 0;
  width: 100%;
  max-width: 380px;
  border-radius: 0;
  box-shadow: none;
}

.signup-button {
  width: 100%;
  background-color: #546bf0;
  border-color: #546bf0;
  padding: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  margin-top: 1.5rem;
}

.signup-footer {
  margin-top: 3rem;
  text-align: center;
  color: #8f95b2;
  font-size: 0.8rem;
}

.signin-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.signin-link span {
  color: #8f95b2;
}

.signin-link a {
  color: #546bf0;
  font-weight: 500;
  margin-left: 0.5rem;
  text-decoration: none;
}

.signin-link a:hover {
  text-decoration: underline;
}

.field {
  margin-bottom: 0;
}

.field + .field {
  margin-top: -17px;
}

.p-inputtext,
.p-password .p-inputtext {
  background-color: #1e1e2d !important;
  border: 1px solid #434968;
  color: #ffffff;
  padding: 0.9rem 1rem;
  width: 100%;
  margin-bottom: 0;
}

.field:first-child .p-inputtext {
  border-radius: 8px 8px 0 0;
}

.field:last-child .p-inputtext {
  border-radius: 0 0 8px 8px;
}

.p-inputtext:focus,
.p-password .p-inputtext:focus {
  border-color: #546bf0;
  box-shadow: 0 0 0 1px #546bf0;
  position: relative;
  z-index: 1;
}

.p-inputtext::placeholder {
  color: #8f95b2;
}

:deep(.p-password) {
  display: flex;
  align-items: center;
  background-color: #1e1e2d;
}

:deep(.p-password-input) {
  width: 100% !important;
  background-color: #1e1e2d !important;
}

:deep(.p-password i) {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  color: #8f95b2;
  z-index: 2;
}

:deep(.p-password-panel) {
  background-color: #2a2a3c;
  color: #c0bfd4;
  border: 1px solid #434968;
}

.error-text {
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style> 