const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  // Increase this value to improve hashing intensity, higher the more secure
  const hashStrength = 10;

  const salt = await bcrypt.genSalt(hashStrength);

  return await bcrypt.hash(password, salt);
};

const authenticateUser = async (password, hashPassword) => {
  const ret = await bcrypt.compare(password, hashPassword);

  if (!ret) {
    return false;
  }
  return true;
};

module.exports = {
  hashPassword: hashPassword,
  authenticateUser: authenticateUser,
};
