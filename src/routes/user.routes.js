const { getUserList } = require("../controllers/user.controller");

const userRoutes = [
  { method: "GET", path: "/users", handler: getUserList },
  // get user list
  // get user details by id
  // edit user
  // terminate user
];

module.exports = userRoutes;
