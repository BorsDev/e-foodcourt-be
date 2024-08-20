const getFullName = (id) => {
  if (id == "") return "system";
  const index = users.findIndex((u) => u.id == id);
  return users[index].fullName;
};

module.exports = async (query, userList) => {
  const page = query.page ? query.page : 0;
  const limit = query.limit ? query.limit : 10;
  const offset = page > 1 ? (page - 1) * limit : 0;

  try {
    const usersList = await userList(["createdAt", "ASC"], limit, offset);
    const users = usersList.data;

    if (!users) {
      return {
        isOK: true,
        data: [],
      };
    }

    let data = [];

    users.forEach((user) => {
      data.push({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        createdBy: getFullName(user.createdById),
        createdAt: user.createdAt,
      });
    });
    return {
      isOK: true,
      data,
    };
  } catch (error) {
    return {
      isOK: false,
      error: error,
    };
  }
};
