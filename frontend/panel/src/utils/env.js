let API_URL = 'https://quiet-walker-455413-p3.ew.r.appspot.com/api'

if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined') {
  API_URL = window?.__VITE_API_URL || API_URL
}

export { API_URL }