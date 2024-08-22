// helper
const { uniqueEmail } = require("../../../helper/auth.helper");
const { generateCode } = require("../../../helper/inviteCode.helper");

class InviteUser {
  constructor(UserRepo, InviteCodeRepo, userId, data, role) {
    this.UserRepo = UserRepo;
    this.InviteCodeRepo = InviteCodeRepo;
    this.createdById = userId;
    this.data = data;
    this.role = role;
  }

  async execute() {
    const emails = this.data;
    const length = emails.length;
    if (length < 1 || length > 5)
      return {
        isOK: false,
        error: { validation: "limit", count: length },
      };
    let errors = [];
    let newUser = [];
    let invitations = [];
    let isError = false;

    for (const email of emails) {
      const isEmailValid = await uniqueEmail(email, this.UserRepo.findByEmail);

      const code = await generateCode();
      if (!isEmailValid.isValid) {
        isError = true;
        errors.push(isEmailValid.err);
      }
      newUser.push({
        fullName: email,
        email,
        role: this.role,
        status: "invited",
        createdById: this.createdById,
        password: "",
      });
      invitations.push({ email, ...code });

      if (isError)
        return {
          isOK: false,
          error: { type: "validation", errors },
        };

      try {
        await this.UserRepo.createBulk(newUser);
        await this.InviteCodeRepo.addInviteCodes(invitations);
        return {
          isOK: true,
        };
      } catch (error) {
        console.log(error);
        throw new Error("INVITE USER USECASE ERROR", error);
      }
    }
  }
}

module.exports = InviteUser;
