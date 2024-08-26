class GetUserById {
  constructor(UserRepo, id) {
    this.UserRepo = UserRepo;
    this.id = id;
  }
  async execute() {
    try {
      const user = await this.UserRepo.findById(this.id);
      if (user.isOK)
        return {
          isOK: false,
        };
      const data = user.data;
      return {
        isOK: true,
        data: {
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          status: data.status,
          createdAt: data.createdAt,
        },
      };
    } catch (error) {
      console.log(error);
      throw new Error("Error at GetUserById");
    }
  }
}

module.exports = GetUserById;
