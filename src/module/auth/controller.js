// helper
const { validateContent } = require("../../helper/form.helper");
const UserRepo = require("../../module/users/db/repo/user.repo");
const Login = require("./usecase/login");
const Logout = require("./usecase/logout");

class AuthController {
  constructor() {
    this.UserRepo = UserRepo;
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }
  async login(req, res) {
    const { payload } = req;
    const requiredPayload = ["email", "password"];
    const validatePayload = validateContent(requiredPayload, payload || {});
    if (!validatePayload.isValid) {
      return res
        .response({ type: "missing_data", fields: validatePayload.err })
        .code(400);
    }

    try {
      const LoginUsecase = new Login(this.UserRepo, payload);
      const result = LoginUsecase.execute();
      if (!result.isOK) return res.response({ type: result.type }).code(400);
      return res.response({ token: result.token });
    } catch (error) {
      console.log(error);
      return res.response({ msg: "server_error" }).code(500);
    }
  }

  async logout(req, res) {
    const { userId } = req.auth.credentials;
    const LogoutUsecase = new Logout(this.UserRepo, userId);
    try {
      const result = LogoutUsecase.execute();
      if (!result.isOK) return res.response({ type: "invalid" }).code(400);
      return res.response({}).code(200);
    } catch (error) {
      console.log(error);
      return res.response({ msg: "server_error" }).code(500);
    }
  }
}

module.exports = AuthController;
