const firestoreService = require('../services/firestore.service');

let configsCache = new Map();
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60000;

const getAllConfigs = async (req, res, next) => {
  try {
    if (!isCacheValid()) {
      await refreshCache();
    }
    
    return res.status(200).json({
      success: true,
      data: Array.from(configsCache.values()),
    });
  } catch (error) {
    return next(error);
  }
};

const getConfigByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const config = isCacheValid() 
      ? configsCache.get(name)
      : await firestoreService.getConfigByName(name);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: `Configuration '${name}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    return next(error);
  }
};

const setConfig = async (req, res, next) => {
  try {
    const { name } = req.params;
    const userId = req.user.uid;
    const configData = req.body;

    if (!configData || Object.keys(configData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Configuration data is required'
      });
    }

    const config = await firestoreService.setConfig(name, configData, userId);
    configsCache.set(name, config);
    cacheTimestamp = Date.now();

    return res.status(200).json({
      success: true,
      data: config,
      message: 'Configuration saved successfully'
    });
  } catch (error) {
    return next(error);
  }
};

const deleteConfig = async (req, res, next) => {
  try {
    const { name } = req.params;
    const success = await firestoreService.deleteConfig(name);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: `Configuration '${name}' not found`
      });
    }

    configsCache.delete(name);
    cacheTimestamp = Date.now();

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

const getJsonConfig = async (req, res, next) => {
  try {
    if (!isCacheValid()) {
      await refreshCache();
    }

    const userCountry = req.query.country;
    const jsonConfig = {};

    configsCache.forEach((config, key) => {
      let value = safeJsonParse(config.content);

      if (config.countryOverrides?.[userCountry] !== undefined) {
        value = safeJsonParse(config.countryOverrides[userCountry]);
      }

      jsonConfig[key] = value;
    });

    return res.status(200).json(jsonConfig);
  } catch (error) {
    return next(error);
  }
};

const isCacheValid = () => {
  return configsCache.size > 0 && (Date.now() - cacheTimestamp < CACHE_TTL_MS);
};

const refreshCache = async () => {
  const configs = await firestoreService.getAllConfigs();
  configsCache.clear();
  configs.forEach(config => configsCache.set(config.id, config));
  cacheTimestamp = Date.now();
};

const safeJsonParse = (value) => {
  if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return value;
};

module.exports = {
  getAllConfigs,
  getConfigByName,
  setConfig,
  deleteConfig,
  getJsonConfig
};
