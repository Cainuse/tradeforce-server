module.exports = {
  standardizeString: (string) => {
    return string.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  },
};
