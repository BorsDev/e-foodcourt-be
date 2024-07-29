const { QueryTypes, where } = require("sequelize");
const {
  validateEmail,
  validatePassword,
  encryptPassword,
  comparePassword,
  generateAuthToken,
  verifyToken,
} = require("../helper/auth.helper");
const { sequelize } = require("../models/__index");
const userModel = require("../models/__index")["user"];
const { findByEmail, create, updateInvitedUser } = require("../repo/user.repo");
const authTokenModel = require("../models/__index")["authToken"];
const { getCodeInfo, deleteCode } = require("../repo/invite_code.repo");

const registerController = async (req, res) => {
  const { query, payload } = req;

  const { type, method } = query || {};
  if (!type || !method)
    return res.response({ errors: "missing_params" }).code(400);

  const { email, fullName, password } = payload || {};
  if (!email || !fullName || !password)
    return res.response({ errors: "missing_data" }).code(400);

  let errors = {};
  let isError = false;

  const isEmailValid = validateEmail(email);
  if (!isEmailValid) {
    isError = true;
    errors.emailErr = "Email is invalid";
  }

  const isPassValid = validatePassword(password);
  if (!isPassValid.isOK) {
    isError = true;
    errors.passErrs = isPassValid.errs;
  }
  const hashedPassword = await encryptPassword(password);

  if (type == "provider" && method == "manual") {
    const isEmailUnique = await findByEmail(email);
    if (isEmailUnique.registered) {
      isError = true;
      errors.emailErr = "Email is registered";
    }
    if (isError) return res.response({ errors }).code(400);

    try {
      await create({
        email,
        fullName,
        role: "owner",
        password: hashedPassword,
        status: "active",
        createdById: "",
      });
      return res.response({}).code(200);
    } catch (error) {
      console.log(error);
      return res.response({ errors: "Server Error" }).code(200);
    }
  }

  console.log(type, method);
  if (type == "provider" && method == "invite") {
    const { code } = query || {};
    if (!code)
      return res.response({ type: "mising_params", fields: "code" }).code(400);

    const userInfoByCode = await getCodeInfo(code);
    if (!userInfoByCode.isOK)
      return res.response({ type: "invalid", fields: "code" }).code(400);

    const invitedEmail = userInfoByCode.data.email;
    const userData = await findByEmail(invitedEmail);
    if (userData.data.status != "invited")
      return res.response({ type: "", fields: "code" }).code(400);

    if (email != invitedEmail)
      return res.response({ type: "invalid", fields: "email" }).code(400);

    try {
      await updateInvitedUser({ fullName, hashedPassword }, email);
      await deleteCode(code);
      return res.response({}).code(200);
    } catch (error) {
      console.log(error);
      return res.response({}).code(400);
    }
  }
  return res.response({ type: "invalid", fields: "method" }).code(400);
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

module.exports = { registerController, loginController, logoutController };
