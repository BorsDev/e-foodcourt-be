const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const inviteCode = sequelize.define("invite_code", {
    email: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Must be a valid email address",
        },
      },
    },
    code: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
  // inviteCode.sync({ force: true }); // comment out after the database created
  return inviteCode;
};
