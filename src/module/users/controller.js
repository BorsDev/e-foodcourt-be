// helper
const { validateContent } = require("../../helper/form.helper");

const UserRepo = require("./db/repo/user.repo");
const InviteCodeRepo = require("./db/repo/invite_code.repo");
const GetUserList = require("./usecase/getUserList");
const InviteUser = require("./usecase/inviteUser");
const ValidateInvitation = require("./usecase/validateInvitation");
const RenewInvitation = require("./usecase/renewInvitation");
const GetUserById = require("./usecase/getUserById");
const ActivateUser = require("./usecase/activateUser");
const InactivateUser = require("./usecase/inactivateUser");
const Register = require("./usecase/register");

class UserController {
  constructor() {
    this.UserRepo = new UserRepo();
    this.InviteCodeRepo = new InviteCodeRepo();
    this.getUserList = this.getUserList.bind(this);
    this.inviteUser = this.inviteUser.bind(this);
    this.validateInvitation = this.validateInvitation.bind(this);
    this.renewInvitation = this.renewInvitation.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.activateUser = this.activateUser.bind(this);
    this.inactivateUser = this.inactivateUser.bind(this);
    this.register = this.register.bind(this);
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

  async renewInvitation(req, res) {
    const { payload } = req;
    const requiredPayload = ["email", "statusFrom"];
    const validatePayload = validateContent(requiredPayload, payload);
    if (!validatePayload.isValid) {
      return res
        .response({ type: "missing_data", fields: validatePayload.err })
        .code(400);
    }

    const { email, statusFrom } = payload;
    const RenewInvitationUsecase = new RenewInvitation(
      this.UserRepo,
      this.InviteCodeRepo,
      email,
      statusFrom,
    );

    try {
      const renewingInvitation = await RenewInvitationUsecase.execute();
      if (!renewingInvitation.isOK)
        return res.response(renewingInvitation.error).code(400);
      return res.response({}).code(200);
    } catch (error) {
      console.log(error);
      return res.response({ msg: "server_error" }).code(500);
    }
  }

  async getUserById(req, res) {
    const { params } = req;
    const { id } = params;
    if (!id)
      return res.response({ type: "missing_params", fields: "id" }).code(400);
    const GetUserByIdUsecase = new GetUserById(this.UserRepo, id);

    try {
      const data = await GetUserByIdUsecase.execute();
      if (!data.isOK) return res.response({ type: "not_found" }).code(404);
      return res.response({ data }).code(200);
    } catch (error) {
      console.log(error);
      return res.response({ msg: "server_error" }).code(500);
    }
  }

  async activateUser(req, res) {
    const { params } = req;
    const { id } = params;
    if (!id)
      return res.response({ type: "missing_params", fields: "id" }).code(400);
    const ActivateUserUseCase = new ActivateUser(this.UserRepo, id);

    try {
      const data = await ActivateUserUseCase.execute();
      if (!data) return res.response({ type: "not_found" }).code(404);
      if (!data.isOK) return res.response({ type: "invalid" }).code(400);
      return res.response({}).code(200);
    } catch (error) {
      console.log(error);
      return res.response({ msg: "server_error" }).code(500);
    }
  }

  async inactivateUser(req, res) {
    const { params } = req;
    const { id } = params;
    if (!id)
      return res.response({ type: "missing_params", fields: "id" }).code(400);
    const InactivateUserUseCase = new InactivateUser(this.UserRepo, id);

    try {
      const data = await InactivateUserUseCase.execute();
      if (!data) return res.response({ type: "not_found" }).code(404);
      if (!data.isOK) return res.response({ type: "invalid" }).code(400);
      return res.response({}).code(200);
    } catch (error) {
      console.log(error);
      return res.response({ msg: "server_error" }).code(500);
    }
  }

  async register(req, res) {
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

    const RegisterUseCase = new Register(
      this.UserRepo,
      this.InviteCodeRepo,
      payload,
    );

    try {
      let error = {};
      let isOK = true;

      if (type == "provider" && method == "manual") {
        const result = await RegisterUseCase.regularProviderRegistration();
        if (!result.isOK) {
          isOK = false;
          error = result.errors;
        }
      }

      if (type == "provider" && method == "invited") {
        const { code } = query;
        const result = await RegisterUseCase.invitedProviderRegistration(code);
        if (!result.isOK) {
          isOK = false;
          error = result.errors;
        }
      }

      if (!isOK) return res.response({ error }).code(400);
      res.response({}).code(200);
    } catch (error) {
      res.response({ msg: "server_error" }).code(500);
    }
  }
}

module.exports = UserController;
