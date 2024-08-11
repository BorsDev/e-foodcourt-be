// require dari controller yg bersangkutan
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");

const routes = [...authRoutes, ...userRoutes];

module.exports = routes;
