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
const authTokenModel = require("../models/__index")["authToken"];

const registerController = async (req, res) => {
  // params validation
  const { type, role, method } = req.query || {};
  if (!type || !role || !method)
    return res.response({ errors: "Missing Params" }).code(400);

  // payload validation
  const { email, fullName, password } = req.payload || {};
  if (!email || !fullName || !password)
    return res.response({ errors: "Missing Data" }).code(400);

  // errors
  let errors = {};
  let isError = false;

  // email validation
  const isEmailValid = validateEmail(email);

  // email not valid format
  if (!isEmailValid) {
    isError = true;
    errors.emailErr = "Email is invalid";
  }

  // if email not unique
  const isEmailUnique = userModel.findOne({ where: { email } });

  if (!isEmailUnique) {
    isError = true;
    errors.emailErr = "Email is registered";
  }

  //password validation
  const isPassValid = validatePassword(password);
  if (!isPassValid.isOK) {
    isError = true;
    errors.passErrs = isPassValid.errs;
  }

  // return validation error
  if (isError) return res.response({ errors }).code(400);

  //return success
  try {
    const hashedPassword = await encryptPassword(password);
    await userModel.create({
      email,
      fullName,
      role,
      password: hashedPassword,
    });
    return res.response({}).code(200);
  } catch (error) {
    console.log(error);
    return res.response({ errors: "Server Error" }).code(200);
  }
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
