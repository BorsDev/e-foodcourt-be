const model = require("../model/__index")["inviteCode"];
const { Op } = require("sequelize");

const addInviteCodes = async (data) => {
  try {
    await model.bulkCreate(data);
    return { isOK: true };
  } catch (error) {
    console.log("Error from addInviteCodes: \n", error);
    return { isOk: false };
  }
};

const getCodeInfo = async (code) => {
  try {
    const data = await model.findOne({ where: { code }, raw: true });
    if (!data) return { isOK: false };
    return { isOK: true, data };
  } catch (error) {
    console.log("Error from getCodeInfo: \n", error);
    return { isOK: false };
  }
};

const deleteCode = async (code) => {
  try {
    await model.destroy({ where: { code } });
    return { isOK: true };
  } catch (error) {
    console.log("Error from deleteCode: \n", error);
    return { isOK: false };
  }
};

const getExpiredCodeEmail = async (currentTime) => {
  try {
    const data = await model.findAll({
      attributes: ["email"],
      where: { expiredAt: { [Op.lt]: currentTime } },
      raw: true,
    });
    return { isOK: true, data };
  } catch (error) {
    console.log("Error from getExpiredCodeEmail: \n", error);
    return { isOK: false };
  }
};

const updateInviteCode = async (data, email) => {
  const { code, expiredAt } = data;
  try {
    await model.update({ code, expiredAt }, { where: { email } });
  } catch (error) {
    console.log("Error from updateCode: \n", error);
    return { isOK: false };
  }
};

module.exports = {
  addInviteCodes,
  getExpiredCodeEmail,
  updateInviteCode,
  getCodeInfo,
  deleteCode,
};
