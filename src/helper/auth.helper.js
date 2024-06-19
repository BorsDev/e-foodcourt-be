const bcrypt = require("bcryptjs");
const passwordValidator = require("password-validator");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const pwdSchema = new passwordValidator()
    .min(14, "Password must contain at least 14 characters")
    .digits(1, "Password must contain at least 1 number")
    .symbols(1, "Password must contain at least 1 of these symbols")
    .uppercase(1, "Password must contain at least 1 uppercase")
    .not()
    .spaces(0, "Password should not contain any spaces");

  const isValid = pwdSchema.validate(password);

  //if password invalid format
  if (!isValid) {
    const errs = [];
    pwdSchema.validate(password, { details: true }).forEach((err) => {
      errs.push({ req: err.validation, msg: err.message });
    });
    return {
      isOK: isValid,
      errs: errs,
    };
  }
  return {
    isOK: true,
  };
};

const encryptPassword = async (password) => {
  const saltRound = 10;
  const hashedPassword = await bcrypt.hash(password.toString(), saltRound);
  return hashedPassword;
};

const comparePassword = async (password, hashedPassword) => {
  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid;
};

module.exports = { validateEmail, validatePassword, encryptPassword };
