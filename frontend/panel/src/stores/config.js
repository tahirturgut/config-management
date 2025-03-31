import { API_URL } from '@/utils/env'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { auth } from '../main'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  async (config) => {
    if (!auth.currentUser) {
      throw new Error('No active session')
    }
    const token = await auth.currentUser.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

export const useConfigStore = defineStore('config', () => {
  const configs = ref([])
  const currentConfig = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  const fetchConfigs = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/config')
      configs.value = response.data.data || []
      return configs.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load configurations'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const fetchConfig = async (name) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/config/${name}`)
      currentConfig.value = response.data.data || null
      return currentConfig.value
    } catch (err) {
      if (err.response?.status === 404) {
        currentConfig.value = null
        return null
      }
      error.value = err.response?.data?.message || err.message || 'Failed to load configuration'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const saveConfig = async (name, configData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/config/${name}`, configData)
      await fetchConfigs()
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to save configuration'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const deleteConfig = async (name) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/config/${name}`)
      await fetchConfigs()
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to delete configuration'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    configs,
    currentConfig,
    loading,
    error,
    fetchConfigs,
    fetchConfig,
    saveConfig,
    deleteConfig
  }
})