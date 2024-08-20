module.exports = async (
  userId,
  data,
  role,
  uniqueEmail,
  generateCode,
  bulkCreate,
  addInviteCodes,
) => {
  const emails = data;
  const length = emails.length;

  if (length < 1 || length > 5)
    return {
      isOK: false,
      error: { validation: "limit", count: length },
    };

  let errors = [];
  let newUser = [];
  let invitations = [];
  let isError = false;

  for (const email of emails) {
    const isEmailValid = await uniqueEmail(email, findByEmail);
    const code = await generateCode();
    if (!isEmailValid.isValid) {
      isError = true;
      errors.push(isEmailValid.err);
    }
    newUser.push({
      fullName: email,
      email,
      role,
      status: "invited",
      createdById: userId,
      password: "",
    });
    invitations.push({ email, ...code });
  }

  if (isError)
    return {
      isOK: false,
      error: { type: "validation", errors },
    };

  try {
    await bulkCreate(newUser);
    await addInviteCodes(invitations);

    return {
      isOK: true,
    };
  } catch (error) {
    console.log(error);
    return {
      isOK: false,
      error,
    };
  }
};
