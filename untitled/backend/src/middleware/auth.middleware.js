const admin = require('../config/firebase');

const firebaseAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token provided'
      });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next(error);
  }
};

const apiTokenMiddleware = (req, res, next) => {
  try {
    const apiToken = req.headers['x-api-token'];
    
    if (!apiToken || apiToken !== process.env.API_TOKEN) {
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