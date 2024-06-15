const { loginController } = require("../controllers/auth.controller");

const authRoutes = [
  {
    method: "POST",
    path: "/auth/register",
    handler: loginController,
  },
];

module.exports = authRoutes;
