const model = require("../models/__index")["user"];
const findByEmail = async (email) => {
  const data = await model.findOne({ where: { email } });
  if (!data) return { isOK: false };
  return { isOk: true, data };
};

module.exports = { findByEmail };
