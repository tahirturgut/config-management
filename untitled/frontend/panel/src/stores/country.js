import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export const useCountryStore = defineStore('country', () => {
  const availableCountries = [
    { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' }
  ]

  const selectedCountry = useLocalStorage('user-country', 'TR')
  
  const countries = computed(() => availableCountries)
  
  const currentCountry = computed(() => {
    return availableCountries.find(c => c.code === selectedCountry.value) || availableCountries[0]
  })
  
  const changeCountry = (countryCode) => {
    const country = availableCountries.find(c => c.code === countryCode)
    if (country) {
      selectedCountry.value = countryCode
      return true
    }
    return false
  }
  
  return {
    countries,
    availableCountries,
    selectedCountry,
    currentCountry,
    changeCountry
  }
}) 