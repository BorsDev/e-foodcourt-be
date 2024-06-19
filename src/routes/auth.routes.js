const { registerController } = require("../controllers/auth.controller");

const authRoutes = [
  {
    method: "POST",
    path: "/auth/register",
    handler: registerController,
  },
];

module.exports = authRoutes;
