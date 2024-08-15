const {
  registerController,
  loginController,
  logoutController,
} = require("./controller");

const authRoutes = [
  {
    method: "POST",
    path: "/auth/register",
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
    path: "/auth/logout/{userId}",
    handler: logoutController,
  },
];

module.exports = authRoutes;
