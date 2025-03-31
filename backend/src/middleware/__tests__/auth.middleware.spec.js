const admin = require('../../config/firebase');
const { firebaseAuthMiddleware } = require('../auth.middleware');

jest.mock('../../config/firebase', () => ({
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn()
  }))
}));

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {
        authorization: 'Bearer test-token'
      }
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

  it('should pass with valid token', async () => {
    const mockDecodedToken = { uid: 'test-uid' };
    admin.auth().verifyIdToken.mockResolvedValue(mockDecodedToken);

    await firebaseAuthMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should reject when no authorization header', async () => {
    mockReq.headers.authorization = undefined;

    await firebaseAuthMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid authentication token provided'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject with invalid token format', async () => {
    mockReq.headers.authorization = 'Invalid-Format';

    await firebaseAuthMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid authentication token provided'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle token verification failure', async () => {
    admin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

    await firebaseAuthMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
}); 