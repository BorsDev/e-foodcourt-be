const { verifyToken } = require("../helper/auth.helper");
const { sequelize } = require("../models/__index");
const { QueryTypes } = require("sequelize");
const { validateEmail, uniqueEmail } = require("../helper/auth.helper");
const { validateContent } = require("../helper/form.helper");
const userModel = require("../models/__index")["user"];
const {
  findByEmail,
  updateExpiredUser,
  updateStatus,
} = require("../repo/user.repo");
const authTokenModel = require("../models/__index")["authToken"];

// invite code
const {
  addInviteCodes,
  getExpiredCodeEmail,
  updateInviteCode,
} = require("../repo/invite_code.repo");
const { generateCode } = require("../helper/inviteCode.helper");

const getUserList = async (req, res) => {
  const { query, headers } = req;
  // Token Validation
  const { token } = headers || {};
  if (!token) return res.response({ errors: "Missing Token" }).code(400);

  // Decode the token & search for existing token
  const { isValid } = await verifyToken(token);
  if (!isValid) {
    return res.response({ msg: "Unauthorized" }).code(401);
  }

  const expiredEmail = await getExpiredCodeEmail(Date.now());
  await updateExpiredUser(expiredEmail.data);

  // if query not provided, returned default stuffs
  const page = query.page ? query.page : 0;
  const limit = query.limit ? query.limit : 10;
  const offset = page > 1 ? (page - 1) * limit : 0;

  const q = `
  SELECT * FROM
    USERS
  ORDER BY
    createdAt
  LIMIT
    ${limit}
  OFFSET
    ${offset}`;

  const users = await sequelize.query(q, {
    type: QueryTypes.SELECT,
  });

  let data = [];
  // function to extract fullname from the createdById
  const getFullName = (id) => {
    if (id == "") return "system";
    const index = users.findIndex((u) => u.id == id);
    return users[index].fullName;
  };

  users.forEach((user) => {
    data.push({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      createdBy: getFullName(user.createdById),
      createdAt: user.createdAt,
    });
  });

  return res.response({ data }).code(200);
};

const inviteUser = async (req, res) => {
  const { query, headers, payload } = req;

  // validate token
  const { token } = headers || {};
  if (!token) return res.response({ errors: "Missing Token" }).code(400);

  const { isValid, userId } = await verifyToken(token);
  if (!isValid) {
    return res.response({ msg: "Unauthorized" }).code(401);
  }

  // validate query value
  const { method, type } = query || {};
  if (!method || !type) {
    let err = [];
    if (!method) err.push("method");
    if (!type) err.push("type");
    return res.response({ type: "missing_params", fields: err }).code(400);
  }

  // validate payload data
  const requiredPayload = ["data", "role"];
  const validatePayload = validateContent(requiredPayload, payload);
  if (!validatePayload.isValid) {
    return res
      .response({ type: "missing_data", fields: validatePayload.err })
      .code(400);
  }

  // validate received email
  const { data, role } = payload || {};
  const emails = data;
  const length = emails.length;

  if (length < 1 || length > 5)
    return res.response({ validation: "limit", count: length }).code(400);

  let errors = [];
  let newUser = [];
  let invitations = [];
  let isError = false;

  for (const email of emails) {
    const isEmailValid = await uniqueEmail(email, findByEmail);
    const code = await generateCode();
    if (!isEmailValid.isValid) {
      isError = true;
      errors.push(isEmailValid.err);
    }
    newUser.push({
      fullName: email,
      email,
      role,
      status: "invited",
      createdById: userId,
      password: "",
    });
    invitations.push({ email, ...code });
  }

  if (isError) return res.response({ type: "validation", errors }).code(400);

  try {
    await userModel.bulkCreate(newUser);
    await addInviteCodes(invitations);

    return res.response({}).code(200);
  } catch (error) {
    console.log(error);
    return res.response({ error }).code(500);
  }
};

const renewInvitation = async (req, res) => {
  const { headers, payload } = req;

  // validate token
  const { token } = headers || {};
  if (!token) return res.response({ errors: "Missing Token" }).code(400);

  const { isValid, userId } = await verifyToken(token);
  if (!isValid) {
    return res.response({ msg: "Unauthorized" }).code(401);
  }

  const requiredPayload = ["email", "statusFrom"];
  const validatePayload = validateContent(requiredPayload, payload);
  if (!validatePayload.isValid) {
    return res
      .response({ type: "missing_data", fields: validatePayload.err })
      .code(400);
  }

  const { email, statusFrom } = payload;
  if (!email)
    return res.response({ error: "validation", fields: "email", value: email });

  if (statusFrom != "expired")
    return res
      .response({
        error: "validation",
        fields: "statusFrom",
        value: statusFrom,
      })
      .code(400);

  try {
    const code = await generateCode();
    await updateStatus("invited", email);
    await updateInviteCode(code, email);
    return res.response({}).code(200);
  } catch (error) {
    console.log("renewInvitation error \n", error);
    return res.response({}).code(500);
  }
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

module.exports = {
  getUserList,
  inviteUser,
  getUserById,
  terminateUserById,
  renewInvitation,
};
