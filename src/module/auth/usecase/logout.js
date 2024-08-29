class Logout {
  constructor(UserRepo, userId) {
    this.UserRepo = UserRepo;
    this.userId = userId;
  }

  async execute() {
    try {
      await this.UserRepo.update({ status: "offline" }, { id: this.userId });
      return { isOK: true };
    } catch (error) {
      console.log(error);
      throw new Error("Logout Usecase Error", error);
    }
  }
}

module.exports = Logout;
