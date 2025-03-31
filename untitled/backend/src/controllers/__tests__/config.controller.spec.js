const firestoreService = require('../../services/firestore.service');
const { 
  getAllConfigs,
  getConfigByName,
  setConfig,
  deleteConfig,
  getJsonConfig
} = require('../config.controller');

jest.mock('../../services/firestore.service');

describe('Config Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
      user: { uid: 'test-user' },
      query: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllConfigs', () => {
    it('should return all configurations', async () => {
      const mockConfigs = [
        { id: 'config1', content: 'value1', description: 'desc1', createdAt: new Date(), countryOverrides: {} },
        { id: 'config2', content: 'value2', description: 'desc2', createdAt: new Date(), countryOverrides: {} }
      ];

      firestoreService.getAllConfigs.mockResolvedValue(mockConfigs);

      await getAllConfigs(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockConfigs
      });
    });
  });

  describe('getConfigByName', () => {
    it('should return configuration by name', async () => {
      const mockConfig = { id: 'config1', content: 'value1' };
      mockReq.params.name = 'config1';

      firestoreService.getConfigByName.mockResolvedValue(mockConfig);

      await getConfigByName(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should return 404 when configuration not found', async () => {
      mockReq.params.name = 'nonexist';
      firestoreService.getConfigByName.mockResolvedValue(null);

      await getConfigByName(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
    });
  });

  describe('setConfig', () => {
    it('should create/update configuration', async () => {
      const mockConfig = { content: 'value1', description: 'desc1' };
      mockReq.params.name = 'config1';
      mockReq.body = mockConfig;

      firestoreService.setConfig.mockResolvedValue(mockConfig);

      await setConfig(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockConfig,
        message: expect.any(String)
      });
    });

    it('should return 400 when no config data provided', async () => {
      mockReq.params.name = 'config1';
      mockReq.body = {};

      await setConfig(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
    });
  });

  describe('deleteConfig', () => {
    it('should delete configuration', async () => {
      mockReq.params.name = 'config1';
      firestoreService.deleteConfig.mockResolvedValue(true);

      await deleteConfig(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 when configuration not found', async () => {
      mockReq.params.name = 'nonexistent';
      firestoreService.deleteConfig.mockResolvedValue(false);

      await deleteConfig(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
    });
  });

  describe('getJsonConfig', () => {
    it('should return configurations in JSON format', async () => {
      const mockConfigs = [
        { id: 'config1', content: 'value1', countryOverrides: { US: 'override1' } },
        { id: 'config2', content: '{"key": "value"}', countryOverrides: { US: '{"key": "override"}' } }
      ];

      mockReq.query.country = 'US';
      firestoreService.getAllConfigs.mockResolvedValue(mockConfigs);

      await getJsonConfig(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        config1: 'override1',
        config2: { key: 'override' }
      });
    });

    it('should handle JSON parsing errors gracefully', async () => {
      const mockConfigs = [
        { id: 'config1', content: 'invalid json', countryOverrides: { US: 'invalid json' } }
      ];

      mockReq.query.country = 'US';
      firestoreService.getAllConfigs.mockResolvedValue(mockConfigs);

      await getJsonConfig(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
}); 