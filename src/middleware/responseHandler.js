const responseHandler = (req, res, next) => {
  res.success = (data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  };

  res.error = (message, statusCode = 400, errors = null) => {
    const response = {
      status: 'error',
      message
    };
    
    if (errors) {
      response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
  };

  next();
};

module.exports = responseHandler;
