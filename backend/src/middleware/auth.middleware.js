const admin = require('../config/firebase');

const PROTECTED_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

const firebaseAuthMiddleware = async (req, res, next) => {
  if (!PROTECTED_METHODS.has(req.method)) {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token provided'
      });
    }

    const idToken = authHeader.split(' ')[1];
    req.user = await admin.auth().verifyIdToken(idToken);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next(error);
  }
};

const apiTokenMiddleware = (req, res, next) => {
  try {
    const apiToken = req.headers['x-api-token'];
    
    if (apiToken !== process.env.API_TOKEN) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API token'
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  firebaseAuthMiddleware, 
  apiTokenMiddleware 
}; 