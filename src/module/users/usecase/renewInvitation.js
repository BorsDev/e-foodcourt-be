const { generateCode } = require("../../../helper/inviteCode.helper");
const { validateEmail } = require("../../../helper/auth.helper");

class RenewInvitation {
  constructor(UserRepo, InviteCodeRepo, email, statusFrom) {
    this.UserRepo = UserRepo;
    this.InviteCodeRepo = InviteCodeRepo;
    this.email = email;
    this.statusFrom = statusFrom;
  }

  async execute() {
    const isValid = validateEmail(this.email);
    if (!isValid)
      return {
        isOK: false,
        error: {
          type: "validation",
          fields: "email",
          value: email,
        },
      };

    if (statusFrom != "expired")
      return {
        isOK: false,
        error: {
          type: "validation",
          fields: "statusFrom",
          value: statusFrom,
        },
      };
    try {
      const code = await generateCode();
      await update({ status: "invited" }, { email });
      await updateInviteCode(code, email);
      return { isOK: true };
    } catch (error) {
      console.log(error);
      throw new Error("Renew Invitation Usecase Errorr", error);
    }
  }
}

module.exports = RenewInvitation;
