const { verifyToken } = require("../helper/auth.helper");
const { sequelize } = require("../models/__index");
const { QueryTypes } = require("sequelize");
const authTokenModel = require("../models/__index")["authToken"];

const getUserList = async (req, res) => {
  const { params, headers } = req;
  // Token Validation
  const { token } = headers || {};
  if (!token) return res.response({ errors: "Missing Token" }).code(400);

  // Decode the token & search for existing token
  const { userId, iat, exp, isValid } = await verifyToken(token);
  const isTokenExist = await authTokenModel.findOne({
    where: { token },
  });

  // If token invalid or not exist -> 401
  if (!isValid || !isTokenExist)
    return res.response({ errors: "Unauthorized" }).code(401);

  // If the token dont match with the user ID -> 401
  if (isTokenExist.userId != userId)
    return res.response({ errors: "Unauthorized" }).code(401);

  // If the token is expired -> destroy the token record in DB
  if (iat >= exp) {
    await isTokenExist.destroy();
    return res.response({ msg: "Expired" }).code(401);
  }

  // if params not provided, returned default stuffs
  const offset = params.offset ? params.offset : 0;
  const limit = params.limit ? params.limit : 10;

  const query = `
  SELECT * FROM
    USERS
  ORDER BY
    createdAt
  LIMIT
    ${limit}
  OFFSET
    ${offset}`;
  const data = await sequelize.query(query, {
    type: QueryTypes.SELECT,
  });

  return res.response({ data }).code(200);
};
// get user details by id
// edit user
// terminate user

module.exports = { getUserList };
