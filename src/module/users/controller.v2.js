// helper
const { validateContent } = require("../../helper/form.helper");

const UserRepo = require("./db/repo/user.repo.v2");
const InviteCodeRepo = require("./db/repo/invite_code.repo.v2");
const GetUserList = require("./usecase/getUserList.v2");
const InviteUser = require("./usecase/inviteUser.v2");
const ValidateInvitation = require("./usecase/validateInvitation");

class UserController {
  constructor() {
    this.UserRepo = new UserRepo();
    this.InviteCodeRepo = new InviteCodeRepo();
    this.getUserList = this.getUserList.bind(this);
    this.inviteUser = this.inviteUser.bind(this);
    this.validateInvitation = this.validateInvitation.bind(this);
  }

  async getUserList(req, res) {
    const { query } = req || {};
    try {
      const UserListUseCase = new GetUserList(
        this.UserRepo,
        this.InviteCodeRepo,
        query,
      );
      const userList = await UserListUseCase.execute();
      return res.response({ data: userList.data }).code(200);
    } catch (error) {
      console.log(error);
      return res.response({ msg: "server_error" }).code(500);
    }
  }

  async inviteUser(req, res) {
    const { userId } = req.auth.credentials;
    const { query, payload } = req || {};
    const { method, type } = query || {};
    if (!method || !type) {
      let err = [];
      if (!method) err.push("method");
      if (!type) err.push("type");
      return res.response({ type: "missing_params", fields: err }).code(400);
    }

    // validate payload data
    const requiredPayload = ["data", "role"];
    const validatePayload = validateContent(requiredPayload, payload || {});
    if (!validatePayload.isValid) {
      return res
        .response({ type: "missing_data", fields: validatePayload.err })
        .code(400);
    }

    // validate received email
    const { data, role } = payload || {};
    const InviteUserUsecase = new InviteUser(
      this.UserRepo,
      this.InviteCodeRepo,
      userId,
      data,
      role,
    );

    try {
      const result = await InviteUserUsecase.execute();
      if (!result.isOK) {
        return res.response({ error: result.error }).code(400);
      }
      return res.response({}).code(200);
    } catch (error) {
      console.log(error);
      return res.respose({ msg: "server_error" }).code(500);
    }
  }

  async validateInvitation(req, res) {
    const { params } = req;
    const { code } = params || {};

    const ValidateInvitationUseCase = new ValidateInvitation(
      this.InviteCodeRepo,
      this.UserRepo,
      code,
    );
    try {
      const result = await ValidateInvitationUseCase.execute();
      if (!result.isOK) return res.response({ msg: "invalid" }).code(400);
      return res.response({}).code(200);
    } catch (error) {
      console.log("validateInvitation controller error \n", error);
      return res.response({ msg: "server_error" }).code(500);
    }
  }
}

module.exports = UserController;
