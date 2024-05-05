const response = (status_code, data, message, res) => {
  res.status(status_code).json({
    status_code: status_code,
    data: data,
    message: message,
  });
};

module.exports = response;
