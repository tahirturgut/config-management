<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const isSubmitting = ref(false)

const storeError = computed(() => authStore.error)

const validateForm = () => {
  let valid = true
  emailError.value = ''
  passwordError.value = ''

  if (!email.value) {
    emailError.value = 'Email address is required'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
    valid = false
  }

  if (!password.value) {
    passwordError.value = 'Password is required'
    valid = false
  }

  return valid
}

const handleSignIn = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  authStore.clearError()

  try {
    await authStore.signIn(email.value, password.value)
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (error) {
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="signin-container">
    <div class="signin-logo">
      <img src="@/assets/images/logo.svg" alt="Logo" />
    </div>

    <h1 class="signin-title">Please sign in</h1>

    <div class="signin-form-card">
      <form @submit.prevent="handleSignIn" class="p-fluid">
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
            :feedback="false"
            :class="{ 'p-invalid': passwordError }"
            aria-describedby="password-error"
          />
          <small v-if="passwordError" id="password-error" class="error-text">{{ passwordError }}</small>
        </div>

        <div v-if="storeError" class="error-text mt-3">{{ storeError }}</div>

        <Button 
          type="submit"
          label="Sign in"
          class="signin-button mt-4"
          :loading="isSubmitting"
          style="background-color: #4361ee; border-color: #4361ee;"
        />
      </form>

      <div class="signup-link">
        <span>Don't have an account?</span>
        <router-link to="/signup">Create account</router-link>
      </div>
    </div>

    <div class="signin-footer">
      <p>Tahir Turgut © {{ new Date().getFullYear() }}</p>
    </div>
  </div>
</template>

<style scoped>
.signin-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #1a1b2e;
  color: #ffffff;
  padding: 1rem;
}

.signin-logo {
  width: 180px;
  height: 180px;
  margin-bottom: 1.5rem;
}

.signin-logo img {
  width: 100%;
  height: 100%;
}

.signin-title {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 400;
  color: #8f95b2;
}

.signin-form-card {
  width: 100%;
  max-width: 380px;
  background: transparent;
  box-shadow: none;
}

.signin-button {
  width: 100%;
  background-color: #546bf0;
  border-color: #546bf0;
  padding: 0.9rem;
  font-weight: bolder;
  border-radius: 8px;
  margin-top: 1.5rem;
}

.signin-footer {
  margin-top: 3rem;
  text-align: center;
  color: #8f95b2;
  font-size: 0.8rem;
}

.signup-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.signup-link span {
  color: #8f95b2;
}

.signup-link a {
  color: #546bf0;
  font-weight: 500;
  margin-left: 0.5rem;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}

.field {
  margin-bottom: 1rem;
}

.p-inputtext,
.p-password .p-inputtext {
  background-color: #1e1e2d !important;
  border: 1px solid #434968;
  color: #ffffff;
  padding: 0.9rem 1rem;
  width: 100%;
}

.p-inputtext:focus,
.p-password .p-inputtext:focus {
  border-color: #546bf0;
  box-shadow: 0 0 0 1px #546bf0;
}

.p-inputtext::placeholder {
  color: #8f95b2;
}

.error-text {
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>