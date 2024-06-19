const {
  registerController,
  loginController,
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
];

module.exports = authRoutes;
