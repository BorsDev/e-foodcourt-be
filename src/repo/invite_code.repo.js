const model = require("../models/__index")["inviteCode"];
const { Op } = require("sequelize");

const addInviteCodes = async (data) => {
  try {
    await model.bulkCreate(data);
    return { isOK: true };
  } catch (error) {
    return { isOk: false, error };
  }
};

const getExpiredCodeEmail = async (currentTime) => {
  try {
    const data = await model.findAll({
      attributes: ["email"],
      where: { expiredAt: { [Op.lt]: currentTime } },
    });

    let emails = [];
    data.forEach((item) => {
      emails.push(item.dataValues.email);
    });
    return { isOK: true, data: emails };
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

module.exports = { addInviteCodes, getExpiredCodeEmail, updateInviteCode };
