const bcrypt = require("bcryptjs");
const passwordValidator = require("password-validator");
const Jwt = require("@hapi/jwt");
require("dotenv").config();

// Auth Token DB
const authTokenModel = require("../models/__index")["authToken"];

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const uniqueEmail = async (email, findByEmail) => {
  let err = [];
  const isValid = validateEmail(email);
  const isRegistered = await findByEmail(email);

  if (!isValid) err.push("invalid");
  if (isRegistered.registered) err.push("registered");

  if (!isValid || isRegistered.registered)
    return { isValid: false, err: { address: email, err } };
  return { isValid: true };
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
  const isValid = validatePassword(password);
  if (!isValid.isOK)
    return {
      isOK: false,
      errs: isValid.errs,
    };

  const saltRound = 10;
  const hashedPassword = await bcrypt.hash(password.toString(), saltRound);
  return { isOK: true, password: hashedPassword };
};

const comparePassword = async (password, hashedPassword) => {
  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid;
};

const generateAuthToken = async (userId) => {
  return Jwt.token.generate(
    {
      userId: userId,
    },
    {
      key: process.env.AUTH_SECRET,
      algorithm: "HS512",
    },
    {
      ttlSec: 14400, // 4 hours
    },
  );
};

const verifyToken = async (token) => {
  const decodedToken = Jwt.token.decode(token);
  const { payload } = decodedToken.decoded;
  const { userId } = payload;
  const options = {};

  const isExist = await authTokenModel.findOne({
    where: { token },
  });
  if (!token) return { isValid: false };

  try {
    Jwt.token.verify(decodedToken, process.env.AUTH_SECRET, options);
    if (isExist.userId != userId) return { isValid: false };
    return {
      isValid: true,
      userId: payload.userId,
    };
  } catch (err) {
    return { isValid: false };
  }
};

module.exports = {
  validateEmail,
  validatePassword,
  encryptPassword,
  comparePassword,
  generateAuthToken,
  verifyToken,
  uniqueEmail,
};
