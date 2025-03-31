import { setActivePinia, createPinia } from 'pinia'
import { useConfigStore } from '../config'
import { auth } from '../../main'
import axios from 'axios'

jest.mock('@/utils/env', () => ({
  API_URL: 'http://localhost:3000/api'
}))
jest.mock('axios')
jest.mock('../../main', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn()
    }
  }
}))

describe('Config Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useConfigStore()
    auth.currentUser.getIdToken.mockResolvedValue('mock-token')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchConfigs', () => {
    it('should fetch configurations successfully', async () => {
      const mockConfigs = [
        { id: 'config1', content: 'value1' },
        { id: 'config2', content: 'value2' }
      ]

      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: { data: mockConfigs } })
      })

      await store.fetchConfigs()

      expect(store.configs).toEqual(mockConfigs)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle fetch error', async () => {
      const errorMessage = 'Failed to fetch'
      
      axios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue({ message: errorMessage })
      })

      await expect(store.fetchConfigs()).rejects.toThrow(errorMessage)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(errorMessage)
    })
  })

  describe('saveConfig', () => {
    it('should save configuration successfully', async () => {
      const mockConfig = { id: 'config1', content: 'value1' }
      
      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: { data: mockConfig } }),
        get: jest.fn().mockResolvedValue({ data: { data: [mockConfig] } })
      })

      const result = await store.saveConfig('config1', mockConfig)

      expect(result).toEqual(mockConfig)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle save error', async () => {
      const errorMessage = 'Failed to save'
      
      axios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue({ message: errorMessage })
      })

      await expect(store.saveConfig('config1', {})).rejects.toThrow(errorMessage)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(errorMessage)
    })
  })

  describe('deleteConfig', () => {
    it('should delete configuration successfully', async () => {
      axios.create.mockReturnValue({
        delete: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockResolvedValue({ data: { data: [] } })
      })

      const result = await store.deleteConfig('config1')

      expect(result).toBe(true)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle delete error', async () => {
      const errorMessage = 'Failed to delete'
      
      axios.create.mockReturnValue({
        delete: jest.fn().mockRejectedValue({ message: errorMessage })
      })

      await expect(store.deleteConfig('config1')).rejects.toThrow(errorMessage)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(errorMessage)
    })
  })
}) 