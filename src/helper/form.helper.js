const validateContent = (fields, content) => {
  let err = [];
  fields.forEach((field) => {
    if (!content.hasOwnProperty(`${field}`)) err.push(`${field}`);
  });

  if (err.length == 0) return { isValid: true };
  return { isValid: false, err };
};

module.exports = { validateContent };
