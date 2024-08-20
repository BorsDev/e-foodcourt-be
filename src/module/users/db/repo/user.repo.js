const model = require("../model/__index")["user"];
const { Op } = require("sequelize");

const create = async (data) => {
  try {
    await model.create({ ...data });
    return { isOK: true };
  } catch (error) {
    console.log("Logging from create User \n", error);
    throw new Error(error);
  }
};

const bulkCreate = async (data) => {
  try {
    await model.bulkCreate(data);
    return { isOK: true };
  } catch (error) {
    console.log("Logging from createBulk \n", error);
    throw new Error(error);
  }
};

const findById = async (id) => {
  try {
    const user = await model.findByPk(id);
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
    console.log("error from findById", error);
    throw new Error(error);
  }
};

const updateInvitedUser = async (data, email) => {
  try {
    await model.update({ ...data, status: "active" }, { where: { email } });
    return { isOK: true };
  } catch (error) {
    console.log("error from updateInvitedUser \n", error);
    throw new Error(error);
  }
};

const findByEmail = async (email) => {
  try {
    const data = await model.findOne({ where: { email } });
    if (!data) return { registered: false };
    return { registered: true, data };
  } catch (error) {
    throw new Error(error);
  }
};

const userList = async (order, limit, offset) => {
  const data = await model.findAll({
    order: [order],
    limit,
    offset,
    raw: true,
  });
  try {
    return { isOK: true, data };
  } catch (error) {
    console.log("error from user.getUserList", error);
    throw new Error(error);
  }
};

const updateExpiredUser = async (email) => {
  try {
    await model.update(
      { status: "expired" },
      { where: { email: { [Op.in]: email } } },
    );
  } catch (error) {
    console.log("updateExpiredUser error \n", error);
    throw new Error(error);
  }
};

const updateStatus = async (status, fields) => {
  try {
    await model.update({ status }, { where: { ...fields } });
  } catch (error) {
    console.log("updateStatus error \n", error);
    throw new Error(error);
  }
};

const update = async (data, conditions) => {
  console.log(conditions);

  try {
    await model.update(data, { where: { ...conditions } });
    return { isOK: true };
  } catch (error) {
    console.log("update error \n", error);
    throw new Error(error);
  }
};

module.exports = {
  create,
  bulkCreate,
  findById,
  findByEmail,
  userList,
  update,
  updateInvitedUser,
  updateExpiredUser,
  updateStatus,
};
