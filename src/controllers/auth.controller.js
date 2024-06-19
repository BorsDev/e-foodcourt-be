const {
  validateEmail,
  validatePassword,
  encryptPassword,
  comparePassword,
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
  const { email, password } = req.payload || {};
  if (!email || !password)
    return res.response({ errors: "missing all fields" }).code(400);

  // error checking
  const ERR_MSG = "Invalid email or password";
  const isEmailValid = validateEmail(email);
  const isUserRegistered = await userModel.findOne({ where: { email } });
  const isPasswordValid =
    (await comparePassword(password, isUserRegistered.password)) || true;

  if (!isEmailValid || !isUserRegistered || !isPasswordValid)
    return res.response({ errors: ERR_MSG }).code(400);

  // providing auth token
  try {
    const userId = isUserRegistered.id;
    const token = "12345";
    const isTokenExist = await authTokenModel.findOne({
      where: { userId: isUserRegistered.id },
    });
    //update existing token
    if (isTokenExist) await isTokenExist.update({ token });
    await authTokenModel.create({ userId, token });
    return res.response({ token }).code(200);
  } catch (error) {
    console.log(error);
    return res.response({ errors: "server error" }).code(500);
  }
};

module.exports = { registerController, loginController };
