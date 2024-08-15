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
  {
    method: "POST",
    path: "/users/invite",
    options: { auth: "jwt" },
    handler: inviteUser,
  },
  {
    method: "PUT",
    path: "/users/invite",
    options: { auth: "jwt" },
    handler: renewInvitation,
  },
  {
    method: "GET",
    path: "/users/invite/{code}",
    options: { auth: false },
    handler: validateInvitation,
  },
  {
    method: "PUT",
    path: "/users/inactivate/{id}",
    options: { auth: "jwt" },
    handler: inactivateUser,
  },
  {
    method: "PUT",
    path: "/users/activate/{id}",
    options: { auth: "jwt" },
    handler: activateUser,
  },
  {
    method: "GET",
    path: "/users/{id}",
    options: { auth: "jwt" },
    handler: getUserById,
  },
  // { method: "DELETE", path: "/users/{id}", handler: terminateUserById },
];

module.exports = userRoutes;
