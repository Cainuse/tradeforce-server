const express = require("express");
const router = express.Router();
const Offering = require("../models/Offering");

// http://localhost/api/offerings ///////////////////////////////////////////////////////
// GET
// Returns all offerings

router.get("/", async (req, res) => {
  try {
    const offerings = await Offering.find();
    res.status(200).json(offerings);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});
