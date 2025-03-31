import { setActivePinia, createPinia } from 'pinia'
import { useCountryStore } from '../country'

describe('Country Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCountryStore()
  })

  describe('countries', () => {
    it('should return all available countries', () => {
      const countries = store.countries
      expect(countries).toHaveLength(4)
      expect(countries).toContainEqual({
        code: 'TR',
        name: 'Turkey',
        flag: '🇹🇷'
      })
    })
  })

  describe('currentCountry', () => {
    it('should return default country (TR) when no country is selected', () => {
      const current = store.currentCountry
      expect(current).toEqual({
        code: 'TR',
        name: 'Turkey',
        flag: '🇹🇷'
      })
    })

    it('should return selected country', () => {
      store.selectedCountry = 'US'
      const current = store.currentCountry
      expect(current).toEqual({
        code: 'US',
        name: 'United States',
        flag: '🇺🇸'
      })
    })

    it('should return default country when selected country is invalid', () => {
      store.selectedCountry = 'INVALID'
      const current = store.currentCountry
      expect(current).toEqual({
        code: 'TR',
        name: 'Turkey',
        flag: '🇹🇷'
      })
    })
  })

  describe('changeCountry', () => {
    it('should change selected country when valid code is provided', () => {
      const result = store.changeCountry('US')
      expect(result).toBe(true)
      expect(store.selectedCountry).toBe('US')
    })

    it('should not change country when invalid code is provided', () => {
      const result = store.changeCountry('INVALID')
      expect(result).toBe(false)
    })

    it('should handle all available country codes', () => {
      const countryCodes = ['TR', 'US', 'DE', 'FR']
      countryCodes.forEach(code => {
        const result = store.changeCountry(code)
        expect(result).toBe(true)
        expect(store.selectedCountry).toBe(code)
      })
    })
  })
}) 