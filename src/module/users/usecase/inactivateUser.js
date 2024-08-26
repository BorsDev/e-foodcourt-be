class InactivateUser {
  constructor(UserRepo, id) {
    this.UserRepo = UserRepo;
    this.id = id;
  }
  async execute() {
    try {
      const isExist = await this.UserRepo.findById(this.id);
      if (!isExist.isOK) return;
      const data = isExist.data;
      if (data.status != "active")
        return {
          isOK: false,
          type: "invalid",
        };
      return {
        isOK: true,
        data,
      };
    } catch (error) {
      console.log(error);
      throw new Error("DeactivateUser Error");
    }
  }
}

module.exports = InactivateUser;
