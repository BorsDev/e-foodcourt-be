const { verifyToken } = require("../helper/auth.helper");
const { sequelize } = require("../models/__index");
const { QueryTypes } = require("sequelize");
const userModel = require("../models/__index")["user"];
const authTokenModel = require("../models/__index")["authToken"];

const getUserList = async (req, res) => {
  const { params, headers } = req;
  // Token Validation
  const { token } = headers || {};
  if (!token) return res.response({ errors: "Missing Token" }).code(400);

  // Decode the token & search for existing token
  const { isValid } = await verifyToken(token);
  if (!isValid) {
    return res.response({ msg: "Unauthorized" }).code(401);
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

const getUserById = async (req, res) => {
  const { params, headers } = req;
  // Token Validation
  const { token } = headers || {};
  if (!token) return res.response({ errors: "Missing Token" }).code(400);

  // Decode the token & search for existing token
  const { isValid } = await verifyToken(token);
  if (!isValid) {
    return res.response({ msg: "Unauthorized" }).code(401);
  }

  // get id
  const { id } = params;
  const user = await userModel.findByPk(id);
  if (!user) return res.response({}).code(404);
  const data = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
  return res.response({ data });
};
// edit user
// terminate user
const terminateUserById = async (req, res) => {
  const { params, headers } = req;
  // Token Validation
  const { token } = headers || {};
  if (!token) return res.response({ errors: "Missing Token" }).code(400);

  // Decode the token & search for existing token
  const { isValid, userId } = await verifyToken(token);
  if (!isValid) {
    return res.response({ msg: "Unauthorized" }).code(401);
  }
  // check user existance
  const { id } = params;
  const user = await userModel.findByPk(id);

  // if data not found
  if (!user) return res.response({}).code(404);

  // if the targeted data is actor data
  if (user.id == userId) return res.response({}).code(403);

  try {
    await user.destroy();
    return res.response({}).code(200);
  } catch (error) {
    return res.response({ msg: "server error" }).code(500);
  }
};

module.exports = { getUserList, getUserById, terminateUserById };
