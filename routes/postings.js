const express = require("express");
const router = express.Router();
const Posting = require("../models/Posting");

// http: localhost/postings/
router.get("/", (req, res) => {
  res.send("Get on postings");
});

router.post("/", (req, res) => {
  console.log(req.body);
});

module.exports = router;
