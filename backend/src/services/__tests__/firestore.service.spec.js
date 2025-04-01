const mockGet = jest.fn();
const mockSet = jest.fn();
const mockDelete = jest.fn();
const mockHistorySet = jest.fn();

jest.mock('../../config/firebase', () => {
  const mockServerTimestamp = jest.fn(() => new Date());

  const mockSubDoc = { set: mockHistorySet };
  const mockSubCollection = { doc: jest.fn(() => mockSubDoc) };

  const mockDocRef = {
    get: mockGet,
    set: mockSet,
    delete: mockDelete,
    collection: jest.fn(() => mockSubCollection)
  };

  const mockCollection = jest.fn(() => ({
    doc: jest.fn(() => mockDocRef),
    orderBy: jest.fn().mockReturnThis(),
    get: mockGet
  }));

  const mockFirestoreInstance = {
    collection: mockCollection
  };

  const firestoreWithFieldValue = Object.assign(
    jest.fn(() => mockFirestoreInstance), 
    {
      FieldValue: {
        serverTimestamp: mockServerTimestamp
      }
    }
  );

  return {
    firestore: firestoreWithFieldValue
  };
});

const firestoreService = require('../firestore.service');
const admin = require('../../config/firebase');

describe('FirestoreService', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockSet.mockReset();
    mockDelete.mockReset();
    mockHistorySet.mockReset();
  });

  describe('getConfigByName', () => {
    it('should return null when config does not exist', async () => {
      mockGet.mockResolvedValue({ exists: false });
      const result = await firestoreService.getConfigByName('test');
      expect(result).toBeNull();
    });

    it('should return config when it exists', async () => {
      const mockData = { content: 'test' };
      mockGet.mockResolvedValue({ exists: true, id: 'test', data: () => mockData });
      const result = await firestoreService.getConfigByName('test');
      expect(result).toEqual({ id: 'test', ...mockData });
    });
  });

  describe('getAllConfigs', () => {
    it('should return empty array when no configs exist', async () => {
      mockGet.mockResolvedValue({ empty: true, docs: [] });
      const result = await firestoreService.getAllConfigs();
      expect(result).toEqual([]);
    });

    it('should return all configs', async () => {
      const mockDocs = [
        { id: 'config1', data: () => ({ content: 'test1' }) },
        { id: 'config2', data: () => ({ content: 'test2' }) }
      ];
      mockGet.mockResolvedValue({ empty: false, docs: mockDocs });
      const result = await firestoreService.getAllConfigs();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 'config1', content: 'test1' });
    });
  });

  describe('setConfig', () => {
    it('should create new config', async () => {
      const mockData = { content: 'test' };
      mockGet
        .mockResolvedValueOnce({ exists: false }) 
        .mockResolvedValueOnce({ exists: true, id: 'test', data: () => mockData });

      const result = await firestoreService.setConfig('test', mockData, 'user1');
      expect(mockSet).toHaveBeenCalled();
      expect(result).toEqual({ id: 'test', ...mockData });
    });

    it('should update existing config', async () => {
      const mockData = { content: 'test', version: 1 };
      mockGet
        .mockResolvedValueOnce({ exists: true, data: () => mockData })
        .mockResolvedValueOnce({ exists: true, id: 'test', data: () => ({ ...mockData, version: 2 }) });

      const result = await firestoreService.setConfig('test', { content: 'updated' }, 'user1');
      expect(mockSet).toHaveBeenCalled();
      expect(result.version).toBe(2);
    });
  });

  describe('deleteConfig', () => {
    it('should return false when config does not exist', async () => {
      mockGet.mockResolvedValue({ exists: false });
      const result = await firestoreService.deleteConfig('test');
      expect(result).toBe(false);
    });

    it('should delete config and return true', async () => {
      mockGet.mockResolvedValue({ exists: true });
      const result = await firestoreService.deleteConfig('test');
      expect(mockDelete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});