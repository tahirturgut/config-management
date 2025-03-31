import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import Dropdown from 'primevue/dropdown'

import './assets/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const analytics = getAnalytics(firebaseApp)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, { ripple: true })
app.use(ToastService)
app.use(ConfirmationService)

app.component('Button', Button)
app.component('Card', Card)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('Dialog', Dialog)
app.component('Textarea', Textarea)
app.component('ProgressSpinner', ProgressSpinner)
app.component('Toast', Toast)
app.component('ConfirmDialog', ConfirmDialog)
app.component('Dropdown', Dropdown)

const clickOutside = {
  beforeMount: (el, binding) => {
    el.clickOutsideEvent = event => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted: el => {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

app.directive('click-outside', clickOutside)

app.mount('#app')
