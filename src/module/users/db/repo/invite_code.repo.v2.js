const Model = require("../model/__index")["inviteCode"];
const { Op } = require("sequelize");

class InviteCodeRepo {
  async addInviteCodes(data) {
    try {
      await Model.bulkCreate(data);
      return { isOK: true };
    } catch (error) {
      throw new Error("Error from addInviteCodes", error);
    }
  }

  async getCodeInfo(code) {
    try {
      const data = await Model.findOne({ where: { code }, raw: true });
      if (!data) return { isOK: false };
      return { isOK: true, data };
    } catch (error) {
      throw new Error("Error from getCodeInfo", error);
    }
  }

  async deleteCode(code) {
    try {
      await Model.destroy({ where: { code } });
      return { isOK: true };
    } catch (error) {
      throw new Error("Error from deleteCode", error);
    }
  }

  async getExpiredCodeEmail(currentTime) {
    try {
      const data = await Model.findAll({
        attributes: ["email"],
        where: { expiredAt: { [Op.lt]: currentTime } },
        raw: true,
      });

      return { isOK: true, data };
    } catch (error) {
      throw new Error("Error from getExpiredCodeEmail", error);
    }
  }

  async updateInviteCode(data, email) {
    const { code, expiredAt } = data;
    try {
      await Model.update({ code, expiredAt }, { where: { email } });
    } catch (error) {
      throw new Error("Error from updateCode", error);
    }
  }
}

module.exports = InviteCodeRepo;
