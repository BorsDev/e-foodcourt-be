const regularProviderRegistration = async (
  data,
  findByEmail,
  uniqueEmail,
  encryptPassword,
  createUser,
) => {
  const { email, password, fullName } = data;
  const role = "owner";
  const status = "active";
  const createdById = "";
  let isOK = true;
  let statusCode = 200;
  let errors = {};

  const isEmailUnique = await uniqueEmail(email, findByEmail);
  if (!isEmailUnique.isValid) {
    isOK = false;
    statusCode = 400;
    errors.email = isEmailUnique.err.err;
  }

  const isPassValid = await encryptPassword(password);
  if (!isPassValid.isOK) {
    isOK = false;
    statusCode = 400;
    errors.password = isPassValid.errs;
  }

  if (isOK) {
    try {
      await createUser({
        email,
        fullName,
        password: isPassValid.password,
        role,
        status,
        createdById,
      });
    } catch (error) {
      isOK = false;
      statusCode = 500;
      errors.random = error;
    }
  }

  if (!isOK) return { isOK, statusCode, errors };
  return { isOK, statusCode };
};

module.exports = { regularProviderRegistration };
