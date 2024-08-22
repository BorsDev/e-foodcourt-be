require("dotenv").config();
const bcrypt = require("bcryptjs");
const Jwt = require("@hapi/jwt");
const passwordValidator = require("password-validator");
const { findById } = require("../module/users/db/repo/user.repo");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const uniqueEmail = async (email, findByEmail) => {
  let err = [];
  const isValid = validateEmail(email);
  const isRegistered = await findByEmail(email);

  if (!isValid) err.push("invalid");
  if (isRegistered.isOK) err.push("registered");

  if (!isValid || isRegistered.isOK) {
    return { isValid: false, err: { address: email, err } };
  }

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

const auth = async (server, Jwt, secret) => {
  await server.register(Jwt);
  server.auth.strategy("jwt", "jwt", {
    keys: secret,
    validate: async (artifacts, req, res) => {
      const { userId } = artifacts.decoded.payload;
      const isExist = await findById(userId);
      const status = isExist.data.status;

      if (!userId || status != "active")
        return res.response({ msg: "unauthorized" }).code(401);
      return {
        isValid: true,
        userId,
      };
    },
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: 14400, // 4 hours
      timeSkewSec: 15,
    },
  });

  server.auth.default("jwt");
};

module.exports = {
  auth,
  validateEmail,
  validatePassword,
  encryptPassword,
  comparePassword,
  generateAuthToken,
  uniqueEmail,
};
