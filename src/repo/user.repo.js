const model = require("../models/__index")["user"];

const findByEmail = async (email) => {
  const data = await model.findOne({ where: { email } });
  if (!data) return { registered: false };
  return { registered: true, data };
};

module.exports = { findByEmail };
