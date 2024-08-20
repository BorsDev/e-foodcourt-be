const InvitedProviderRegistration = async (
  code,
  data,
  getCodeInfo,
  findByEmail,
  encryptPassword,
  update,
  deleteCode,
) => {
  const { email, password, fullName } = data || {};
  const status = "active";
  let isOK = true;
  let statusCode = 200;
  let errors = {};

  if (!code) {
    statusCode = 400;
    errors = {
      type: "missing_params",
      fields: ["code"],
    };
    return { statusCode, errors };
  }

  const codeInfo = await getCodeInfo(code);
  const isExist = codeInfo.isOK;
  if (!isExist) {
    isOK = false;
    statusCode = 400;
    errors.code = "invalid";
  }

  if (isOK) {
    const emailInfo = codeInfo.data?.email;
    const user = await findByEmail(emailInfo);
    const isMatch = email == user.data.email;
    const isInvited = user.data.status == "invited";
    if (!isExist || !isMatch || !isInvited) {
      isOK = false;
      statusCode = 400;
      errors.code = "invalid";
    }
  }

  const isPassValid = await encryptPassword(password);
  if (!isPassValid.isOK) {
    isOK = false;
    statusCode = 400;
    errors.password = isPassValid.errs;
  }

  if (isOK) {
    try {
      await update(
        { fullName, password: isPassValid.password, status: "active" },
        email,
      );
      await deleteCode(code);
    } catch (error) {
      isOK = false;
      statusCode = 500;
      errors.random = error;
    }
  }

  if (!isOK) return { isOK, statusCode, errors };
  return { isOK, statusCode };
};

module.exports = { InvitedProviderRegistration };
