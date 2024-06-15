const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
      autoIncrement: false,
    },
    fullName: {
      type: Sequelize.DataTypes.STRING(50),
      allowNull: false,
    },
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
    role: {
      type: Sequelize.DataTypes.ENUM("owner", "admin"),
      allowNull: false,
    },
    password: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
  });
  //   User.sync(); // comment out after the database created
  return User;
};
