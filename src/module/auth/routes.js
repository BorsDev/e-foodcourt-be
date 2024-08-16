const { loginController, logoutController } = require("./controller");

const authRoutes = [
  {
    method: "PATCH",
    path: "/auth/login",
    options: { auth: false },
    handler: loginController,
  },
  {
    method: "DELETE",
    path: "/auth/logout",
    options: { auth: "jwt" },
    handler: logoutController,
  },
];

module.exports = authRoutes;
