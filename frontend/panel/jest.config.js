export default {
  testTimeout: 10000,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
  moduleFileExtensions: ['vue', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^vue$': 'vue/dist/vue.runtime.esm-bundler.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.spec.[jt]s?(x)',
    '<rootDir>/src/**/*.spec.[jt]s?(x)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!src/App.vue',
    '!src/**/*.d.ts',
  ],
  coverageReporters: ['text', 'html'],
  coverageDirectory: 'coverage',
  transformIgnorePatterns: [
    'node_modules/(?!(@vueuse|vue-demi|primevue|pinia|vue|@vue)/)',
  ],
  globals: {
    'vue-jest': {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('prime-'),
      },
      experimentalCSSSupport: true
    }
  }
}