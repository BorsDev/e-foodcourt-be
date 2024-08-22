class ValidateInvitation {
  constructor(InviteCoderepo, UserRepo, code) {
    this.InviteCoderepo = InviteCoderepo;
    this.UserRepo = UserRepo;
    this.code = code;
  }

  async execute() {
    try {
      const isExist = await this.InviteCoderepo.getCodeInfo(this.code);
      if (!isExist.isOK) return { isOK: false };

      const currentTime = Date.now();
      const { email, expiredAt } = isExist.data;
      if (currentTime > expiredAt) {
        await this.UserRepo.updateExpiredUser([email]);
        return { isOK: false };
      }
      return {
        isOK: true,
      };
    } catch (error) {
      console.log(error);
      throw new Error("ValidateInvitation Usecase Error");
    }
  }
}

module.exports = ValidateInvitation;
