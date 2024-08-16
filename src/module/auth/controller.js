// helper
const { validateContent } = require("../../helper/form.helper");
const {
  comparePassword,
  generateAuthToken,
} = require("../../helper/auth.helper");

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
  const userId = isExist.data.id;
  const isPasswordValid = await comparePassword(password, pwd);
  if (!userId || !isPasswordValid)
    return res.response({ type: "invalid" }).code(400);

  try {
    const newtoken = await generateAuthToken(userId);
    await update({ status: "active" }, { id: userId });
    return res.response({ token: newtoken }).code(200);
  } catch (error) {
    console.log(error);
    return res.response({ errors: "server error" }).code(500);
  }
};

const logoutController = async (req, res) => {
  const { userId } = req.auth.credentials;
  try {
    await update({ status: "offline" }, { id: userId });
    return res.response({ msg: "Logout Successfully" }).code(200);
  } catch (error) {
    return res.response({ errors: "Server Error" }).code(500);
  }
};

module.exports = {
  loginController,
  logoutController,
};
