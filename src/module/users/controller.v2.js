const UserRepo = require("./db/repo/user.repo.v2");
const InviteCodeRepo = require("./db/repo/invite_code.repo.v2");
const GetUserList = require("./usecase/getUserList.v2");

class UserController {
  constructor() {
    this.UserRepo = new UserRepo();
    this.InviteCodeRepo = new InviteCodeRepo();
    this.getUserList = this.getUserList.bind(this);
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
}

module.exports = UserController;
