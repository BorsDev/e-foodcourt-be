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
      type: Sequelize.DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
  });
  // AuthToken.sync({ force: true }); // comment out after the database created
  return AuthToken;
};
