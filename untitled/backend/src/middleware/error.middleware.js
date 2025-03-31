const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message, err.stack);

  if (err.code && err.code.startsWith('auth/')) {
    return res.status(401).json({
      success: false,
      error: err.message || 'Authentication error'
    });
  }

  if (err.code && err.code.startsWith('firestore/')) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Database error'
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

module.exports = { errorHandler }; 