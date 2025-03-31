<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useCountryStore } from './stores/country'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const authStore = useAuthStore()
const countryStore = useCountryStore()
const toast = useToast()
const isLoading = ref(true)
const showProfileMenu = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

const userEmail = computed(() => authStore.user?.email || 'User')
const userInitials = computed(() => {
  if (!authStore.user?.email) return '?'
  
  const email = authStore.user.email
  if (email && email.length > 0) {
    return email[0].toUpperCase()
  }
  return '?'
})

const currentCountry = computed(() => countryStore.currentCountry)

const changeUserCountry = (countryCode) => {
  countryStore.changeCountry(countryCode)
  showProfileMenu.value = false
}

const signOut = async () => {
  try {
    await authStore.signOut()
    router.push('/signin')
  } catch (error) {
    router.push('/signin')
  }
}

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const closeProfileMenu = () => {
  showProfileMenu.value = false
}

onMounted(async () => {
  try {
    await authStore.initializeAuth()
  } catch (error) {
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="app-container" :class="{ 'is-authenticated': isAuthenticated }">
    <header v-if="isAuthenticated && !$route.path.includes('signin') && !$route.path.includes('signup')" class="app-header">
      <div class="app-header-content">
        <div class="logo-container">
          <img src="@/assets/images/logo.svg" alt="Logo" class="app-logo" />
        </div>
        <div class="app-header-actions">
          <div class="profile-container" v-click-outside="closeProfileMenu">
            <div class="profile-button" @click="toggleProfileMenu">
              <div class="profile-avatar">
                <i class="pi pi-user"></i>
              </div>
              <i class="pi pi-chevron-down dropdown-icon"></i>
            </div>
            <div class="profile-menu" v-show="showProfileMenu">
              <div class="profile-menu-header">
                <div class="profile-email">{{ userEmail }}</div>
                <div class="current-country">
                  <span class="country-flag">{{ currentCountry.flag }}</span>
                  <span>{{ currentCountry.name }}</span>
                </div>
              </div>
              <div class="profile-menu-items">
                <div class="profile-menu-section">
                  <div class="section-title">Change Country</div>
                  <div class="country-list">
                    <button 
                      v-for="country in countryStore.countries" 
                      :key="country.code"
                      class="country-item"
                      :class="{ active: country.code === countryStore.selectedCountry }"
                      @click="changeUserCountry(country.code)"
                    >
                      <span class="country-flag">{{ country.flag }}</span>
                      <span class="country-name">{{ country.name }}</span>
                    </button>
                  </div>
                </div>
                <div class="profile-divider"></div>
                <button class="profile-menu-item" @click="signOut">
                  <i class="pi pi-sign-out"></i>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <Toast position="top-right" />
    <ConfirmDialog />

    <main class="app-content">
      <div v-if="isLoading" class="loading-container">
        <ProgressSpinner />
      </div>
      <router-view v-else />
    </main>

    <footer v-if="!isAuthenticated" class="app-footer">
      <p>&copy; 2025 - Tahir Turgut</p>
    </footer>
  </div>
</template>

<style>
:root {
  --primary-color: #5e72e4;
  --background-color: #1e1e2d;
  --card-background: #1e1e2d;
  --text-color: #c0bfd4;
  --text-light: #a7a7c5;
  --border-color: #464670;
  --header-height: 70px;
  --footer-height: 50px;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  min-height: 100vh;
}

:deep(.p-component) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(.p-button) {
  border-radius: 6px;
}

:deep(.p-card) {
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.p-datatable) {
  background-color: var(--card-background);
  border-radius: 8px;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: var(--card-background);
  color: var(--text-light);
  border-color: var(--border-color);
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: var(--card-background);
  color: var(--text-color);
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
  background-color: rgba(255, 255, 255, 0.02);
}

:deep(.p-dialog) {
  background-color: var(--card-background);
  border-radius: 8px;
}

:deep(.p-dialog-header),
:deep(.p-dialog-content) {
  background-color: var(--card-background);
  color: var(--text-color);
}

:deep(.p-inputtext) {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: var(--border-color);
  color: var(--text-color);
}

:deep(.p-inputtext:focus) {
  box-shadow: 0 0 0 1px var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.p-toast) {
  opacity: 0.95;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-container.is-authenticated {
  padding-top: var(--header-height);
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background-color: var(--background-color);
  box-shadow: none;
  z-index: 10;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-header-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
}

.logo-container {
  display: flex;
  align-items: center;
}

.app-logo {
  height: 32px;
}

.app-title {
  display: none;
}

.app-header-actions {
  display: flex;
  align-items: center;
}

.profile-container {
  position: relative;
  display: flex;
  align-items: center;
}

.profile-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.profile-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar i {
  color: #1a1a27;
  font-size: 1.2rem;
}

.dropdown-icon {
  margin-left: 5px;
  color: #ffffff;
  font-size: 0.8rem;
}

.profile-menu {
  position: absolute;
  top: 50px;
  right: 0;
  width: 280px;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  z-index: 100;
  overflow: hidden;
}

.profile-menu-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.profile-email {
  font-size: 0.9rem;
  color: var(--text-color);
  word-break: break-all;
  margin-bottom: 0.5rem;
}

.current-country {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-light);
}

.country-flag {
  margin-right: 0.5rem;
  font-size: 1.1rem;
}

.profile-menu-items {
  padding: 0.5rem 0;
}

.profile-menu-section {
  padding: 0.5rem 1rem;
}

.section-title {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.country-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 150px;
  overflow-y: auto;
}

.country-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  border: none;
  background: none;
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;
}

.country-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.country-item.active {
  background-color: rgba(94, 114, 228, 0.15);
  color: #ffffff;
}

.country-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 0.5rem 0;
}

.profile-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--text-color);
  transition: background-color 0.2s;
}

.profile-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.profile-menu-item i {
  font-size: 1rem;
  color: var(--text-light);
}

.app-content {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 3rem 0;
}

.app-footer {
  height: var(--footer-height);
  background-color: var(--card-background);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-light);
}

@media (max-width: 768px) {
  .app-title {
    font-size: 1.2rem;
  }
  
  .app-logo {
    height: 24px;
  }
  
  .app-header-content {
    padding: 0 1rem;
  }
  
  .profile-menu {
    width: 250px;
  }
}
</style> 