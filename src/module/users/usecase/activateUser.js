class ActivateUser {
  constructor(UserRepo, id) {
    this.UserRepo = UserRepo;
    this.id = id;
  }
  async execute() {
    try {
      const isExist = await this.UserRepo.findById(this.id);
      if (!isExist.isOK)
        return {
          isOK: false,
          type: "not_found",
        };
      const data = isExist.data;
      if (data.status != "inactive")
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
      throw new Error("ActivateUser Error");
    }
  }
}
