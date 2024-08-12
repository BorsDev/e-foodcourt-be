// db
const { sequelize } = require("./models/__index");
const authTokenModel = require("./models/__index")["authToken"];

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
const { findByEmail, create, updateInvitedUser } = require("../repo/user.repo");
const { getCodeInfo, deleteCode } = require("../repo/invite_code.repo");

// usecase
const {
  regularProviderRegistration,
} = require("../usecase/regularProviderRegistration");
const {
  InvitedProviderRegistration,
} = require("../usecase/InvitedProviderRegistration");

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
  // Get the credentials from payload -> return 400 if nothing provided
  const { email, password } = req.payload || {};
  if (!email || !password)
    return res.response({ errors: "missing all fields" }).code(400);

  // const new valdiation
  const isUserToken = await sequelize.query(`
    select
      users.id as userId,
      users.password as pwd,
      authtokens.token
    from
      users left join authtokens on users.id = authtokens.userId
    where
      email = '${email}'`);

  const { userId, pwd, token } = isUserToken[0][0] || {};
  const isPasswordValid = await comparePassword(password, pwd);
  if (!userId || !isPasswordValid)
    return res.response({ errors: "Invalid Credentials" }).code(400);

  // Check for existing token, destroy if found any
  const newtoken = await generateAuthToken(userId);
  if (token) await authTokenModel.destroy({ where: { userId } });

  // Insert token
  try {
    await authTokenModel.create({ userId, token: newtoken });
    return res.response({ token: newtoken }).code(200);
  } catch (error) {
    console.log(error);
    return res.response({ errors: "server error" }).code(500);
  }
};

const logoutController = async (req, res) => {
  const { headers } = req;
  // Token Validation
  const { token } = headers || {};
  if (!token) return res.response({ errors: "Missing Token" }).code(400);

  // Decode the token & search for existing token
  const { isValid } = await verifyToken(token);
  if (!isValid) {
    return res.response({ msg: "Unauthorized" }).code(401);
  }

  // Token valid -> destroy token
  try {
    await isTokenExist.destroy();
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
