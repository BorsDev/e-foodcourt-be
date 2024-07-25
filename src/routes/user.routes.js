const {
  getUserList,
  getUserById,
  terminateUserById,
  inviteUser,
} = require("../controllers/user.controller");

const userRoutes = [
  { method: "GET", path: "/users", handler: getUserList },
  { method: "POST", path: "/users/invite", handler: inviteUser },
  { method: "GET", path: "/users/{id}", handler: getUserById },
  { method: "DELETE", path: "/users/{id}", handler: terminateUserById },
  // get user list
  // get user details by id
  // edit user
  // terminate user
];

module.exports = userRoutes;
