const model = require("../models/__index")["inviteCode"];

const addInviteCode = async (data) => {
  const { userId, code, expiredAt } = data || {};
  try {
    model.create({ userId, code, expiredAt });
    return { isOK: true };
  } catch (error) {
    console.log(error);
    return { isOk: false, error };
  }
};

module.exports = { addInviteCode };
