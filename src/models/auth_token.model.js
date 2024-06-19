const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const AuthToken = sequelize.define("authToken", {
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
      unique: true,
      autoIncrement: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    token: {
      type: Sequelize.DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
      autoIncrement: false,
    },
  });
  // AuthToken.sync(); // comment out after the database created
  return AuthToken;
};
