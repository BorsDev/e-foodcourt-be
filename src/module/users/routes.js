const {
  getUserList,
  getUserById,
  inviteUser,
  renewInvitation,
  validateInvitation,
  inactivateUser,
  activateUser,
  // terminateUserById,
} = require("./controller");

const userRoutes = [
  {
    method: "GET",
    path: "/users",
    options: { auth: "jwt" },
    handler: getUserList,
  },
  { method: "POST", path: "/users/invite", handler: inviteUser },
  { method: "PUT", path: "/users/invite", handler: renewInvitation },
  { method: "GET", path: "/users/invite/{code}", handler: validateInvitation },
  { method: "PUT", path: "/users/inactivate/{id}", handler: inactivateUser },
  { method: "PUT", path: "/users/activate/{id}", handler: activateUser },
  { method: "GET", path: "/users/{id}", handler: getUserById },
  // { method: "DELETE", path: "/users/{id}", handler: terminateUserById },
];

module.exports = userRoutes;