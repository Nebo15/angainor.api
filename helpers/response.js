export let helperRes = (req, res, next) => {
  res.sendJson = (data, code) => {
    return res.status(code || 200).json({
      "meta": {
        "code": code || 200
      },
      data
    });
  };

  res.sendJsonError = (code, message, error) => {
    return res.status(code).json({
      "meta": {
        code,
        "error": message
      },
      "data": error
    });
  };

  next();
};