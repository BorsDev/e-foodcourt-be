// helper
const { validateContent } = require("../../helper/form.helper");
const {
  encryptPassword,
  comparePassword,
  generateAuthToken,
  verifyToken,
  uniqueEmail,
} = require("../../helper/auth.helper");

// repo
const {
  findByEmail,
  update,
  create,
  updateInvitedUser,
} = require("../users/db/repo/user.repo");
const {
  getCodeInfo,
  deleteCode,
} = require("../users/db/repo/invite_code.repo");

// usecase
const {
  regularProviderRegistration,
  InvitedProviderRegistration,
} = require("../users/usecase/register");

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

const loginController = async (req, res) => {
  const { payload } = req;
  const requiredPayload = ["email", "password"];
  const validatePayload = validateContent(requiredPayload, payload || {});
  if (!validatePayload.isValid) {
    return res
      .response({ type: "missing_data", fields: validatePayload.err })
      .code(400);
  }

  const { email, password } = payload;
  const isExist = await findByEmail(email);
  const pwd = isExist.data.password;
  const userId = isExist.data.password;
  const status = isExist.data.status;
  const isPasswordValid = await comparePassword(password, pwd);
  if (!userId || !isPasswordValid || status != "offline")
    return res.response({ type: "invalid" }).code(400);

  try {
    const newtoken = await generateAuthToken(userId);
    await update({ status: "active" }, [userId]);
    return res.response({ token: newtoken }).code(200);
  } catch (error) {
    console.log(error);
    return res.response({ errors: "server error" }).code(500);
  }
};

const logoutController = async (req, res) => {
  const { userId } = req.auth.credentials;
  try {
    await update({ status: "offline" }, [userId]);
    return res.response({ msg: "Logout Successfully" }).code(200);
  } catch (error) {
    return res.response({ errors: "Server Error" }).code(500);
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
};
