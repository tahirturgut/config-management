let API_URL = 'http://localhost:3000/api'

if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined') {
  API_URL = window?.__VITE_API_URL || API_URL
}

export { API_URL }