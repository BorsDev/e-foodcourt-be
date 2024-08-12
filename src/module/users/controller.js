const { verifyToken } = require("../../helper/auth.helper");
const { uniqueEmail } = require("../../helper/auth.helper");
const { validateContent } = require("../../helper/form.helper");
const {
  bulkCreate,
  findByEmail,
  findById,
  update,
  updateExpiredUser,
  updateStatus,
  userList,
} = require("./db/repo/user.repo");

// invite code
const {
  addInviteCodes,
  getExpiredCodeEmail,
  updateInviteCode,
  getCodeInfo,
} = require("./db/repo/invite_code.repo");
const { generateCode } = require("../../helper/inviteCode.helper");

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

  const expiredUser = await getExpiredCodeEmail(Date.now());

  const expiredEmail = [];
  expiredUser.data.forEach((user) => {
    expiredEmail.push(user.email);
  });

  await updateExpiredUser(expiredEmail);

  // if query not provided, returned default stuffs
  const page = query.page ? query.page : 0;
  const limit = query.limit ? query.limit : 10;
  const offset = page > 1 ? (page - 1) * limit : 0;

  const usersList = await userList(["createdAt", "ASC"], limit, offset);
  const users = usersList.data;

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
    await bulkCreate(newUser);
    await addInviteCodes(invitations);

    return res.response({}).code(200);
  } catch (error) {
    console.log(error);
    return res.response({ error }).code(500);
  }
};

const validateInvitation = async (req, res) => {
  const { params } = req;
  const { code } = params || {};
  const existCode = await getCodeInfo(code);
  if (!existCode.isOK) return res.response({}).code(400);

  const currentTime = Date.now();
  const info = {
    email: existCode.data.email,
    expiredAt: existCode.data.expiredAt,
  };
  if (currentTime > info.expiredAt) {
    await updateExpiredUser([info.email]);
    return res.response({}).code(400);
  }

  return res.response({ data: info }).code(200);
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
  const user = await findById(id);
  if (!user) return res.response({}).code(404);
  const data = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
  return res.response({ data });
};

const inactivateUser = async (req, res) => {
  const { params, headers } = req || {};
  const { token } = headers || {};
  if (!token) return res.response({ errors: "Missing Token" }).code(400);

  const { isValid } = await verifyToken(token);
  if (!isValid) {
    return res.response({ msg: "unauthorized" }).code(401);
  }

  let isOK = true;
  let statusCode = 200;
  let errors = {
    type: "",
    status: {},
  };
  const { id } = params || {};
  if (!id)
    return res.respons({ type: "missing_params", fields: "userId" }).code(400);

  const isExist = await findById(id);
  if (!isExist.isOK) {
    isOK = false;
    errors = isExist.error;
    statusCode = isExist.error == "not_found" ? 404 : 500;
  }

  if (isExist.data.status != "active") {
    isOK = false;
    errors.type = "validation";
    errors.status.data = isExist.data.status;
    errors.status.action = "inactive";
  }

  const result = await update({ status: "inactive" }, { id });
  if (!result.isOK) {
    isOK = false;
    errors.random = result.errors;
  }
  if (isOK) return res.response({}).code(statusCode);
  return res.response(errors).code(statusCode);
};

const activateUser = async (req, res) => {
  const { params, headers } = req || {};
  const { token } = headers || {};
  if (!token) return res.response({ errors: "Missing Token" }).code(400);

  const { isValid } = await verifyToken(token);
  if (!isValid) {
    return res.response({ msg: "unauthorized" }).code(401);
  }

  let isOK = true;
  let statusCode = 200;
  let errors = {
    type: "",
    status: {},
  };
  const { id } = params || {};
  if (!id)
    return res.respons({ type: "missing_params", fields: "userId" }).code(400);

  const isExist = await findById(id);
  if (!isExist.isOK) {
    isOK = false;
    errors = isExist.error;
    statusCode = isExist.error == "not_found" ? 404 : 500;
  }

  if (isExist.data.status != "inactive") {
    isOK = false;
    errors.type = "validation";
    errors.status.data = isExist.data.status;
    errors.status.action = "active";
  }

  const result = await update({ status: "active" }, { id });
  if (!result.isOK) {
    isOK = false;
    errors.random = result.errors;
  }
  if (isOK) return res.response({}).code(statusCode);
  return res.response(errors).code(statusCode);
};

module.exports = {
  getUserList,
  inviteUser,
  getUserById,
  renewInvitation,
  validateInvitation,
  inactivateUser,
  activateUser,
};
