const model = require("../models/__index")["inviteCode"];

const addInviteCodes = async (data) => {
  try {
    model.bulkCreate(data);
    return { isOK: true };
  } catch (error) {
    return { isOk: false, error };
  }
};

module.exports = { addInviteCodes };
