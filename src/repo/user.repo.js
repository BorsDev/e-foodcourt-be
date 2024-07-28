const model = require("../models/__index")["user"];
const { Op } = require("sequelize");

const findByEmail = async (email) => {
  const data = await model.findOne({ where: { email } });
  if (!data) return { registered: false };
  return { registered: true, data };
};

const updateExpiredUser = async (email) => {
  try {
    await model.update(
      { status: "expired" },
      { where: { email: { [Op.in]: email } } },
    );
  } catch (error) {
    console.log("updateExpiredUser error");
  }
};
const updateStatus = async (status, email) => {
  try {
    await model.update({ status }, { where: { email } });
  } catch (error) {
    console.log("updateStatus error \n", error);
  }
};

module.exports = { findByEmail, updateExpiredUser, updateStatus };
