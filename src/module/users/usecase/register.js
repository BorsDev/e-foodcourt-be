const { uniqueEmail, encryptPassword } = require("../../../helper/auth.helper");

class Register {
  constructor(UserRepo, InvitationCodeRepo, data) {
    this.UserRepo = UserRepo;
    this.InvitationCodeRepo = InvitationCodeRepo;
    this.data = data;
  }
  async regularProviderRegistration() {
    const { email, password, fullName } = this.data;
    let isOK = true;
    let errors = {};

    const isEmailUnique = await uniqueEmail(email, this.UserRepo.findByEmail);
    if (!isEmailUnique.isValid) {
      isOK = false;
      errors.email = isEmailUnique.err.err;
    }

    const isPassValid = await encryptPassword(password);
    if (!isPassValid.isOK) {
      isOK = false;
      errors.password = isPassValid.errs;
    }
    if (!isOK)
      return {
        isOK: false,
        errors,
      };

    try {
      await this.UserRepo.createUser({
        email,
        fullName,
        password: isPassValid.password,
        role: "owner",
        status: "active",
        createdById: "",
      });

      return { isOK: true };
    } catch (error) {
      console.log(error);
      throw new Error("RegularProviderRegistration", error);
    }
  }

  async invitedProviderRegistration(code = "") {
    const { email, password, fullName } = this.data || {};
    if (!code) return {};

    const codeInfo = await this.InvitationCodeRepo.getCodeInfo(code);
    if (!codeInfo.isOK)
      return {
        isOK: false,
        errors: {
          type: "invalid",
          fields: ["code"],
        },
      };

    let isOK = true;
    let errors = {};
    const emailInfo = codeInfo.data?.email;
    const user = await this.UserRepo.findByEmail(emailInfo);
    const isMatch = email == user.data.email;
    const isInvited = user.data.status == "invited";
    if (!isMatch || !isInvited) {
      isOK = false;
      errors = {
        type: "invalid",
        fields: ["code"],
      };
    }

    const isPassValid = await encryptPassword(password);
    if (!isPassValid.isOK) {
      isOK = false;
      errors.password = isPassValid.errs;
    }
    if (!isOK) {
      return { isOK: false, errors };
    }

    try {
      await this.UserRepo.update(
        { fullName, password: isPassValid.password, status: "active" },
        { email },
      );
      await this.InvitationCodeRepo.deleteCode(code);
      return { isOK: true };
    } catch (error) {
      console.log(error);
      throw new Error("InvitedProvideRegistration", error);
    }
  }
}

module.exports = Register;
