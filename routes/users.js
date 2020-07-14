const express = require("express");
const User = require("../models/User").User;
const joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const Offering = require("../models/Offering");
const Posting = require("../models/Posting");
const Review = require("../models/User").Review;
const router = express.Router();

const SecurityUtil = require("../utils/securityUtil");
const validateToken = require("../middleware/validateToken");

const registerValidation = joi.object({
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  userName: joi.string().required(),
  email: joi.string().required().email(),
  password: joi.string().required(),
  postalCode: joi.string(),
  dateRegistered: joi.date(),
  isGoogleUser: joi.boolean().required(),
});

const loginValidation = joi.object({
  email: joi.string().required().email(),
  password: joi.string().required(),
  isGoogleLogin: joi.boolean().required(),
});

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

  const { error } = registerValidation.validate(reqBody);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  let user;
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

  if (user) {
    res.status(400).json({
      message: "This email has already been registered.",
    });
  } else {
    const user = new User({
      firstName: reqBody.firstName,
      lastName: reqBody.lastName,
      userName: reqBody.userName,
      email: reqBody.email,
      postalCode: reqBody.postalCode,
      dateRegistered: reqBody.dateRegistered,
      isGoogleUser: reqBody.isGoogleUser,
    });

    try {
      user.password = await SecurityUtil.hashPassword(reqBody.password);

      const savedUser = await user.save();
      const token = jwt.sign(user.toJSON(), process.env.TOKEN_SECRET);
      res.header("auth-token", token);
      res.status(201).json({
        user: savedUser,
        token,
      });
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
router.post("/login", async (req, res) => {
  const reqBody = req.body;

  const { error } = loginValidation.validate(reqBody);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const { isGoogleLogin } = reqBody;

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

  if (!user && !isGoogleLogin) {
    res.status(404).json({
      message: "User does not exist.",
    });
  }

  const authenticated = await SecurityUtil.authenticateUser(
    reqBody.password,
    user.password
  );

  if (!authenticated && !isGoogleLogin) {
    res.status(400).json({
      message: "Incorrect user credentials.",
    });
    return;
  }

  const token = jwt.sign(user.toJSON(), process.env.TOKEN_SECRET);
  res.header("auth-token", token);
  res.status(200).json({
    user,
    token,
  });
});

router.post("/authenticate", validateToken);

// http://localhost/api/users/{userId} ////////////////////////////////////////////
// GET
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({
        message:
          "The given user id does not match any user records. Try again.",
      });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// http://localhost/api/users/{userId}/offerings/ ////////////////////////////////////////////
// Get all offerings that a user has made
router.get("/:userId/offerings", async (req, res) => {
  try {
    const offeringsOfUser = await Offering.find({
      userId: req.params.userId,
    });

    res.status(200).json(offeringsOfUser);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.get("/:userId/offerings/active", async (req, res) => {
  try {
    const offeringsOfUser = await Offering.find({
      userId: req.params.userId,
      status: "PENDING",
    });
    res.status(200).json(offeringsOfUser);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.get("/:userId/offerings/inactive", async (req, res) => {
  try {
    const offeringsOfUser = await Offering.find({
      userId: req.params.userId,
      status: { $not: "PENDING" },
    });
    res.status(200).json(offeringsOfUser);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// Get all drilled down details about a postings by the user of the given userId (Use this to get all the offerings pending)
router.get("/:userId/postings/complete", async (req, res) => {
  try {
    const postingsOfUser = await Posting.find({
      ownerId: req.params.userId,
      active: true,
    }).populate("offerings");

    res.status(200).json(postingsOfUser);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// Add review to the user with userName
router.post("/:userName/reviews", async (req, res) => {
  const review = await new Review({
    title: req.body.title,
    review: req.body.review,
    rating: req.body.rating,
    reviewUsername: req.body.reviewUsername,
  }).save();

  try {
    const userToUpdate = await User.findOneAndUpdate(
      {
        userName: req.params.userName,
      },
      { $push: { reviews: review._id } },
      { new: true }
    );

    res.status(201).json(userToUpdate);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// Get all drilled down details about a user with userName (Use this to get Reviews)
router.get("/:userName/complete", async (req, res) => {
  try {
    const userToUpdate = await User.findOne({
      userName: req.params.userName,
    })
      .populate("reviews")
      .exec();

    res.status(201).json(userToUpdate);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// http://localhost/api/users/{userId}/postings/ ////////////////////////////////////////////
// Get all postings that a user has made
router.get("/:userId/postings", async (req, res) => {
  try {
    const postingsOfUser = await Posting.find({
      ownerId: req.params.userId,
    });

    res.status(200).json(postingsOfUser);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.get("/:userId/postings/active", async (req, res) => {
  try {
    const postingsOfUser = await Posting.find({
      ownerId: req.params.userId,
      active: true,
    });

    res.status(200).json(postingsOfUser);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.get("/:userId/postings/inactive", async (req, res) => {
  try {
    const postingsOfUser = await Posting.find({
      ownerId: req.params.userId,
      active: false,
    });

    res.status(200).json(postingsOfUser);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.get("/findUser/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      res.status(404).json({
        message:
          "The given user email does not match any user records. Try again.",
      });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// DELETE
router.delete("/:userId", async (req, res) => {
  try {
    const deletedUser = await User.deleteOne({ _id: req.params.userId });
    res.status(204).send();
  } catch (err) {
    console.log(err);
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
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.delete("/", async (req, res) => {
  try {
    await User.deleteMany({});
    res.status(200).json({
      message: "successfully removed all users.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

module.exports = router;
