const { uniqueEmail, encryptPassword } = require("../../helper/auth.helper");
const { generateCode } = require("../../helper/inviteCode.helper");
const { validateContent } = require("../../helper/form.helper");
const {
  bulkCreate,
  findByEmail,
  findById,
  update,
  updateExpiredUser,
  updateStatus,
  userList,
  create,
  updateInvitedUser,
} = require("../users/db/repo/user.repo");

const {
  getCodeInfo,
  deleteCode,
  addInviteCodes,
  getExpiredCodeEmail,
  updateInviteCode,
} = require("./db/repo/invite_code.repo");

// usecase
const {
  regularProviderRegistration,
  InvitedProviderRegistration,
} = require("../users/usecase/register");
const getUsersList = require("./usecase/getUserList");
const inviteUsers = require("../users/usecase/inviteUser");

const registerController = async (req, res) => {
  const { query, payload } = req;

  const requiredQuery = ["type", "method"];
  const validateQuery = validateContent(requiredQuery, query || {});
  if (!validateQuery.isValid) {
    return res
      .response({ type: "missing_params", fields: validateQuery.err })
      .code(400);
  }

  const { type, method } = query;
  const availType = ["provider"];
  const supportedType = availType.includes(type);
  if (!supportedType) {
    return res.response({
      type: "unsupported",
      value: query.type,
      availType,
    });
  }

  const availMethod = ["manual", "invited"];
  const supportedMethod = availMethod.includes(method);
  if (!supportedMethod) {
    return res.response({
      type: "unsupported",
      value: query.method,
      availMethod,
    });
  }

  const requiredPayload = ["email", "fullName", "password"];
  const validatePayload = validateContent(requiredPayload, payload || {});
  if (!validatePayload.isValid) {
    return res
      .response({ type: "missing_data", fields: validatePayload.err })
      .code(400);
  }

  let errors = {};
  let statusCode = 200;
  if (type == "provider" && method == "manual") {
    const registration = await regularProviderRegistration(
      payload,
      findByEmail,
      uniqueEmail,
      encryptPassword,
      create,
    );
    statusCode = registration.statusCode;
    if (!registration.isOK) errors = registration.errors;
  }

  if (type == "provider" && method == "invited") {
    const code = query.code;
    const registration = await InvitedProviderRegistration(
      code,
      payload,
      getCodeInfo,
      findByEmail,
      encryptPassword,
      updateInvitedUser,
      deleteCode,
    );
    statusCode = registration.statusCode;
    if (!registration.isOK) errors = registration.errors;
  }

  // returning segment
  if (statusCode == 500)
    return res.response({ type: "server_error" }).code(statusCode);

  if (statusCode == 401) return res.response(errors).code(statusCode);

  if (statusCode == 400)
    return res.response({ type: "validation", errors }).code(statusCode);

  return res.response({}).code(statusCode);
};

const getUserList = async (req, res) => {
  const { query } = req || {};
  const getList = await getUsersList(
    query,
    userList,
    getExpiredCodeEmail,
    updateExpiredUser,
  );
  if (!getList.isOK) {
    return res.response({ msg: "server_error" }).code(500);
  }
  const { data } = getList;
  if (data.length == 0) {
    return res.response({ msg: "not_found" }).code(404);
  }
  return res.response({ data }).code(200);
};

const inviteUser = async (req, res) => {
  const { userId } = req.auth.credentials;
  const { query, payload } = req;
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
  const invitingUser = await inviteUsers(
    userId,
    data,
    role,
    uniqueEmail,
    generateCode,
    bulkCreate,
    addInviteCodes,
  );

  if (!invitingUser.isOK) {
    const error = invitingUser.error;
    res.response(error).code(400);
  }
  res.response({}).code(200);
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
  const { payload } = req;
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
  const { params } = req;
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
  const { params } = req || {};
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
  registerController,
  getUserList,
  inviteUser,
  getUserById,
  renewInvitation,
  validateInvitation,
  inactivateUser,
  activateUser,
};
