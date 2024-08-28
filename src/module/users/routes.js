const UserController = require("./controller.v2");
const userController = new UserController();
const userRoutes = [
  {
    method: "POST",
    path: "/v2/auth/register",
    options: { auth: false },
    handler: userController.register,
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
    handler: userController.getUserById,
  },
  {
    method: "PUT",
    path: "/v2/users/activate/{id}",
    options: { auth: "jwt" },
    handler: userController.activateUser,
  },
  {
    method: "PUT",
    path: "/v2/users/inactivate/{id}",
    options: { auth: "jwt" },
    handler: userController.inactivateUser,
  },
];

module.exports = userRoutes;
