const {
  comparePassword,
  generateAuthToken,
} = require("../../../helper/auth.helper");

class Login {
  constructor(UserRepo, data) {
    this.data = data;
    this.UserRepo = UserRepo;
  }

  async execute() {
    const { email, password } = this.data;
    const isExist = await this.UserRepo.findByEmail(email);

    if (!isExist.isOK)
      return {
        isOK: false,
        type: invalid,
      };

    const { data } = isExist.data;
    const pwd = data.password;
    const userId = data.id;

    const isPasswordValid = await comparePassword(password, pwd);
    if (!userId || !isPasswordValid)
      return {
        isOK: false,
        type: invalid,
      };

    try {
      const newtoken = await generateAuthToken(userId);
      await this.UserRepo.update({ status: "active" }, { id: userId });
      return { isOK: true, token: newtoken };
    } catch (error) {
      console.log(error);
      throw new Error("Login Usecase Errorr");
    }
  }
}

module.exports = Login;
