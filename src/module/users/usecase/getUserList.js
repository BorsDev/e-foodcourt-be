class GetUserList {
  constructor(UserRepo, InviteCodeRepo, query = {}) {
    this.UserRepo = UserRepo;
    this.InviteCodeRepo = InviteCodeRepo;
    this.page = query.page || 1;
    this.limit = query.limit || 10;
    this.offset = this.page > 1 ? (this.page - 1) * limit : 0;
  }
  async updateExpireUser() {
    const expiredUser = await this.InviteCodeRepo.getExpiredCodeEmail(
      Date.now(),
    );
    const expiredEmail = [];
    expiredUser.data.forEach((user) => {
      expiredEmail.push(user.email);
    });
    await this.UserRepo.updateExpiredUser(expiredEmail);
  }

  getFullName(id, users) {
    if (id === "") return "SYSTEM";
    const index = users.findIndex((u) => u.id == id);
    return users[index].fullName;
  }

  async execute() {
    try {
      await this.updateExpireUser();
      const result = await this.UserRepo.getList(
        ["createdAt", "ASC"],
        this.limit,
        this.offset,
      );

      const list = result.data || [];
      if (!list)
        return {
          isOK: true,
          data: list,
        };

      const data = list.map((item) => {
        return { ...item, createdBy: this.getFullName(item.createdById, list) };
      });
      return {
        isOK: true,
        data,
      };
    } catch (error) {
      console.log(error);

      throw new Error("GET USER LIST USECASE ERROR", error);
    }
  }
}

module.exports = GetUserList;
