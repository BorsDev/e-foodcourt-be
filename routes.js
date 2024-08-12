// require dari controller yg bersangkutan
const authRoutes = require("./src/module/auth/routes");
const userRoutes = require("./src/module/users/routes");

const routes = [...authRoutes, ...userRoutes];

module.exports = routes;
