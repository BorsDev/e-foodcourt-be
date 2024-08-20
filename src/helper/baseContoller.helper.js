module.exports = baseController = async (req, res, func) => {
  const { statusCode, msg } = await func(req, res);
  // returning segment
  if (statusCode == 500)
    return res.response({ type: "server_error" }).code(statusCode);

  if (statusCode == 401) return res.response(errors).code(statusCode);

  if (statusCode == 400)
    return res.response({ type: "validation", errors }).code(statusCode);

  return res.response({}).code(statusCode);
};
