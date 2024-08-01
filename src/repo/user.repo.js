const model = require("../models/__index")["user"];
const { Op } = require("sequelize");

const create = async (data) => {
  try {
    await model.create({ ...data });
    return { isOK: true };
  } catch (error) {
    console.log("Logging from create User \n", error);
    return { isOK: false, error };
  }
};
const updateInvitedUser = async (data, email) => {
  try {
    await model.update({ ...data, status: "active" }, { where: { email } });
    return { isOK: true };
  } catch (error) {
    console.log("error from updateInvitedUser \n", error);
    return { isOK: false, error };
  }
};

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
    console.log("updateExpiredUser error \n", error);
    return { isOK: false, error };
  }
};

const updateStatus = async (status, email) => {
  try {
    await model.update({ status }, { where: { email } });
  } catch (error) {
    console.log("updateStatus error \n", error);
    return { isOK: false, error };
  }
};

module.exports = {
  create,
  updateInvitedUser,
  findByEmail,
  updateExpiredUser,
  updateStatus,
};
