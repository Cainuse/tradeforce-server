const express = require("express");
const User = require("../models/User");

const router = express.Router();

const SecurityUtil = require("../utils/securityUtil");
const { route } = require("./postings");

// http://localhost/api/users ///////////////////////////////////////////////////////
// GET
// Returns all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});
// POST
// Creates user based on input parameters
router.post("/", async (req, res) => {
  const reqBody = req.body;

  try {
    let user = await User.findOne({
      email: reqBody.email,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }

  if (user) {
    res.status(400).json({
      message: "This email has already been registered.",
    });
  } else {
    const user = new User({
      userName: reqBody.userName,
      email: reqBody.email,
      // password: reqBody.password,
      postalCode: reqBody.postalCode,
      dateRegistered: reqBody.dateRegistered,
    });

    try {
      user.password = await SecurityUtil.hashPassword(reqBody.password);

      const savedUser = await user.save();
      res.status(201).json(savedUser);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Error code 500: Failed to process request",
      });
    }
  }
});

// POST
// Authenticate user
router.post("/authenticate", async (req, res) => {
  const reqBody = req.body;
  let user = null;
  try {
    user = await User.findOne({
      email: reqBody.email,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }

  if (!user) {
    res.status(404).json({
      message: "User does not exist.",
    });
  }

  const authenticated = await SecurityUtil.authenticateUser(
    reqBody.password,
    user.password
  );

  if (!authenticated) {
    res.status(400).json({
      message: "Incorrect user credentials.",
    });
    return;
  }

  res.status(200).json(user);
});

// http://localhost/api/users/{userId} ////////////////////////////////////////////
// GET
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).send();
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// DELETE
router.delete("/:userId", async (req, res) => {
  try {
    const deletedUser = await User.remove({ _id: req.params.userId });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// PATCH
router.patch("/:userId", async (req, res) => {
  try {
    const updatedUser = await User.updateOne(
      { _id: req.params.userId },
      { $set: req.body }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

module.exports = router;
