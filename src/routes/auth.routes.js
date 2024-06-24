const {
  registerController,
  loginController,
  logoutController,
} = require("../controllers/auth.controller");

const authRoutes = [
  {
    method: "POST",
    path: "/auth/register",
    handler: registerController,
  },
  {
    method: "PATCH",
    path: "/auth/login",
    handler: loginController,
  },
  {
    method: "DELETE",
    path: "/auth/logout/{userId}",
    handler: logoutController,
  },
];

module.exports = authRoutes;
