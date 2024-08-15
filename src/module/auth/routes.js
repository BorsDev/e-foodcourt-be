const {
  registerController,
  loginController,
  logoutController,
} = require("./controller");

const authRoutes = [
  {
    method: "POST",
    path: "/auth/register",
    options: { auth: false },
    handler: registerController,
  },
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
