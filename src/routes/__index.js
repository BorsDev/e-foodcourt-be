// require dari controller yg bersangkutan
const authRoutes = require("./auth.routes");

const routes = [...authRoutes];

module.exports = routes;
