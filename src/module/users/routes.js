const {
  registerController,
  getUserList,
  getUserById,
  inviteUser,
  renewInvitation,
  validateInvitation,
  inactivateUser,
  activateUser,
} = require("./controller");

const UserController = require("./controller.v2");
const userController = new UserController();
const userRoutes = [
  {
    method: "POST",
    path: "/auth/register",
    options: { auth: false },
    handler: registerController,
  },
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
  {
    method: "GET",
    path: "/v2/users",
    options: { auth: "jwt" },
    handler: userController.getUserList,
  },
  {
    method: "POST",
    path: "/v2/users/invite",
    options: { auth: "jwt" },
    handler: userController.inviteUser,
  },
  {
    method: "GET",
    path: "/v2/users/invite/{code}",
    options: { auth: false },
    handler: userController.validateInvitation,
  },
  {
    method: "PUT",
    path: "/v2/users/invite",
    options: { auth: "jwt" },
    handler: userController.renewInvitation,
  },
  {
    method: "GET",
    path: "/v2/users/{id}",
    options: { auth: "jwt" },
    handler: getUserById,
  },
];

module.exports = userRoutes;
