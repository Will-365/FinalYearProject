const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = field === 'email' 
      ? 'Email already registered' 
      : field === 'nationalId' 
        ? 'National ID already registered' 
        : 'Duplicate field value entered';
    return res.status(400).json({ success: false, message });
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token has expired' });
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Server error',
  });
};

export default errorHandler;
