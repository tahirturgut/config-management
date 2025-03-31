const express = require('express');
const router = express.Router();
const { 
  getAllConfigs, 
  getConfigByName, 
  setConfig, 
  deleteConfig, 
  updateCountryConfig,
  getJsonConfig
} = require('../controllers/config.controller');
const { firebaseAuthMiddleware } = require('../middleware/auth.middleware');

router.use(firebaseAuthMiddleware);

router.get('/', getAllConfigs);

router.get('/json', getJsonConfig);

router.get('/:name', getConfigByName);

router.post('/:name', setConfig);

router.delete('/:name', deleteConfig);

module.exports = router; 