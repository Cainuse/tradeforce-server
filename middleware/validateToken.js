const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).json({
      message: "Access denied!",
    });
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    res.set("Access-Control-Allow-Origin", "*");
    res.status(200).json(verified);
    next();
  } catch (err) {
    res.status(400).json({
      message: "Invalid Token",
    });
  }
};
