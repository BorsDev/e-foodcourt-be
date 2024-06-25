const { QueryTypes } = require("sequelize");
const {
  validateEmail,
  validatePassword,
  encryptPassword,
  comparePassword,
  generateAuthToken,
  verifyToken,
} = require("../helper/auth.helper");
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

  // Check credential validity -> return 400 if not match
  const isUser = await userModel.findOne({ where: { email } });
  const isPasswordValid = await comparePassword(password, isUser.password);
  console.log(isUser);
  if (!isUser || !isPasswordValid)
    return res.response({ errors: "Invalid Credentials" }).code(400);

  // Define user's id
  const userId = isUser.id;

  // Check for existing token, destroy if found any
  const token = await generateAuthToken(userId);
  const isTokenExist = await authTokenModel.findOne({
    where: { userId },
  });
  if (isTokenExist) await isTokenExist.destroy();

  // Insert token
  try {
    await authTokenModel.create({ userId, token });
    return res.response({ token }).code(200);
  } catch (error) {
    console.log(error);
    return res.response({ errors: "server error" }).code(500);
  }
};

const logoutController = async (req, res) => {
  // Token sanitation
  const { token } = req.payload || {};
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
  if (iat + 14400 >= exp) {
    await isTokenExist.destroy();
    return res.response({ msg: "Expired" }).code(401);
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
