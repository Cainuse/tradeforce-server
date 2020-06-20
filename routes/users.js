const express = require("express");

const router = express.Router();

// http: localhost/postings/
router.get("/", (req, res) => {
  res.send("Get on users");
});

module.exports = router;
