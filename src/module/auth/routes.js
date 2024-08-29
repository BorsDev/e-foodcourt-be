const AuthController = require("./controller");
const authController = new AuthController();

const authRoutes = [
  {
    method: "PATCH",
    path: "/auth/login",
    options: { auth: false },
    handler: authController.login,
  },
  {
    method: "DELETE",
    path: "/auth/logout",
    options: { auth: "jwt" },
    handler: authController.logout,
  },
];

module.exports = authRoutes;
