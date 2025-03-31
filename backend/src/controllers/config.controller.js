const firestoreService = require('../services/firestore.service');
const admin = require('../config/firebase');
const fieldValue = admin.firestore.FieldValue;

let configsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60000;

const getAllConfigs = async (req, res, next) => {
  try {
    let configs;
    if (isCacheValid()) {
      configs = configsCache;
    } else {
      configs = await firestoreService.getAllConfigs();
      configsCache = configs;
      cacheTimestamp = Date.now();
    }
    
    const filteredConfigs = configs.map(({ id, content, description, createdAt, countryOverrides }) => ({
      id,
      content,
      description,
      createdAt,
      countryOverrides,
    }));

    return res.status(200).json({
      success: true,
      data: filteredConfigs,
    });
  } catch (error) {
    return next(error);
  }
};

const getConfigByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    let config;
    
    if (isCacheValid()) {
      config = configsCache.find(cfg => cfg.id === name);
    } else {
      config = await firestoreService.getConfigByName(name);
    }

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

    if (configData.countryOverrides && typeof configData.countryOverrides === 'object') {
      const newOverrides = Object.fromEntries(
        Object.entries(configData.countryOverrides).map(([key, value]) => [key, value === null ? fieldValue.delete() : value])
      );
      configData.countryOverrides = Object.keys(newOverrides).length === 0
        ? fieldValue.delete()
        : newOverrides;
    }

    const config = await firestoreService.setConfig(name, configData, userId);
    
    configsCache = null;
    cacheTimestamp = 0;

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

    configsCache = null;
    cacheTimestamp = 0;

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

const getJsonConfig = async (req, res, next) => {
  try {
    let configs;
    if (isCacheValid()) {
      configs = configsCache;
    } else {
      configs = await firestoreService.getAllConfigs();
      configsCache = configs;
      cacheTimestamp = Date.now();
    }
    
    const userCountry = req.query.country;

    const jsonConfig = configs.reduce((acc, config) => {
      let value = safeJsonParse(config.content);

      if (config.countryOverrides && userCountry && config.countryOverrides[userCountry] !== undefined) {
        value = safeJsonParse(config.countryOverrides[userCountry]);
      }

      acc[config.id] = value;
      return acc;
    }, {});

    return res.status(200).json(jsonConfig);
  } catch (error) {
    return next(error);
  }
};

const isCacheValid = () => {
  return configsCache && (Date.now() - cacheTimestamp < CACHE_TTL_MS);
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