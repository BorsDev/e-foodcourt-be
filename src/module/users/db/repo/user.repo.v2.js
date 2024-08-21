const { Op } = require("sequelize");
const Model = require("../model/__index")["user"];

class UserRepo {
  async create(data) {
    try {
      await Model.create({ ...data });
      return { isOK: true };
    } catch (error) {
      throw new Error("DB Insert Error on Create User", error);
    }
  }

  async createBulk(data) {
    try {
      await Model.bulkCreate(data);
      return { isOK: true };
    } catch (error) {
      throw new Error("DB Insert Error on Create Bulk User", error);
    }
  }

  async findById(id) {
    try {
      const user = await Model.findByPk(id);
      if (!user)
        return {
          isOK: false,
          error: "not_found",
        };
      return {
        isOK: true,
        data: user,
      };
    } catch (error) {
      throw new Error("DB FindbyID User", error);
    }
  }

  async findByEmail(email) {
    try {
      const user = await Model.findOne({ where: { email }, raw: true });
      if (!user)
        return {
          isOK: false,
          error: "not_found",
        };
    } catch (error) {
      throw new Error("DB FindbyID User", error);
    }
  }

  async getList(order, limit, offset) {
    try {
      const data = await Model.findAll({
        attributes: [
          "id",
          "fullName",
          "email",
          "role",
          "status",
          "createdById",
          "createdAt",
        ],
        order: [order],
        limit,
        offset,
        raw: true,
      });
      return { isOK: true, data };
    } catch (error) {
      throw new Error("DB GetList User", error);
    }
  }

  async updateExpiredUser(email) {
    try {
      await Model.update(
        { status: "expired" },
        { where: { email: { [Op.in]: email } } },
      );
    } catch (error) {
      throw new Error("DB UpdateExpiredUser User", error);
    }
  }

  async update(data, conditions) {
    try {
      await Model.update(data, { where: { ...conditions } });
      return { isOK: true };
    } catch (error) {
      throw new Error("DB Update User", error);
    }
  }
}

module.exports = UserRepo;
