const express = require("express");
const User = require("../models/User").User;
const joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const Offering = require("../models/Offering");
const Posting = require("../models/Posting");
const Review = require("../models/User").Review;
const LocationUtil = require("../utils/locationUtil");
const router = express.Router();

const SecurityUtil = require("../utils/securityUtil");

const registerValidation = joi.object({
  firstName: joi.string().required(),
  lastName: joi.string(),
  userName: joi.string().required(),
  email: joi.string().required().email(),
  password: joi.string().required(),
  postalCode: joi.string(),
  profilePic: joi.string(),
  dateRegistered: joi.date(),
  isGoogleUser: joi.boolean().required(),
});

const loginValidation = joi.object({
  email: joi.string().required().email(),
  password: joi.string().required(),
  isGoogleLogin: joi.boolean().required(),
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
    return res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }

  if (user) {
    return res.status(400).json({
      message: "This email has already been registered.",
    });
  } else {
    const location = reqBody.postalCode
      ? await LocationUtil.getLocationByPostalCode(reqBody.postalCode)
      : {
          location: "Central Vancouver | Vancouver, BC",
          lat: 49.2830972,
          lon: -123.1175032,
        };
    const user = new User({
      firstName: reqBody.firstName,
      lastName: reqBody.lastName,
      userName: reqBody.userName,
      email: reqBody.email,
      postalCode: reqBody.postalCode,
      profilePic: reqBody.profilePic,
      dateRegistered: reqBody.dateRegistered,
      isGoogleUser: reqBody.isGoogleUser,
      location: location,
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
      res.status(500).json({
        message: "Error code 500: Failed to process request",
      });
    }
  }
});

// POST
// Login user
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
    return res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }

  if (!user && !isGoogleLogin) {
    return res.status(404).json({
      message: "User does not exist.",
    });
  }

  const authenticated = await SecurityUtil.authenticateUser(
    reqBody.password,
    user.password
  );

  if (!authenticated && !isGoogleLogin) {
    return res.status(400).json({
      message: "Incorrect user credentials.",
    });
  }

  const token = jwt.sign(user.toJSON(), process.env.TOKEN_SECRET);
  res.header("auth-token", token);
  res.status(200).json({
    user,
    token,
  });
});

// /api/users/authenticate
// Authenticate user
router.post("/authenticate", (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(401).json({
      message: "Access denied! Token is unavailable.",
    });
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    res.set("Access-Control-Allow-Origin", "*");
    req.user = verified;
    res.status(200).json(verified);
  } catch (err) {
    res.status(400).json({
      message: "Invalid Token provided!",
    });
  }
});

// /api/users/{userId}
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
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// /api/users/{userId}/offerings/
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

// Get all drilled down details about a postings by the user of the given userId
// (Use this to get all the offerings pending)
router.get("/:userId/postings/complete", async (req, res) => {
  try {
    const postingsOfUser = await Posting.find({
      ownerId: req.params.userId,
      active: true,
    }).populate("offerings");
    const postingPreviews = postingsOfUser.map((post) => ({
      _id: post._id,
      date: post.date,
      title: post.title,
      location: post.location,
      images: [post.images[0]],
      offerings: post.offerings,
      ownerId: post.ownerId,
    }));
    res.status(200).json(postingPreviews);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// Add review to the user with userName
router.post("/:userId/reviews", async (req, res) => {
  const review = await new Review({
    title: req.body.title,
    review: req.body.review,
    rating: req.body.rating,
    reviewUsername: req.body.reviewUsername,
  }).save();

  try {
    const userToUpdate = await User.findOneAndUpdate(
      {
        _id: req.params.userId,
      },
      { $push: { reviews: review._id } },
      { new: true }
    );

    res.status(201).json(userToUpdate);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// Get all drilled down details about a user with userName (Use this to get Reviews)
router.get("/:userId/complete", async (req, res) => {
  try {
    const userToUpdate = await User.findOne({
      _id: req.params.userId,
    })
      .populate("reviews")
      .exec();

    res.status(201).json(userToUpdate);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// /api/users/{userId}/postings/
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
    const postingPreviews = postingsOfUser.map((post) => ({
      _id: post._id,
      date: post.date,
      title: post.title,
      location: post.location,
      images: [post.images[0]],
      ownerId: post.ownerId,
    }));
    res.status(200).json(postingPreviews);
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
    const postingPreviews = postingsOfUser.map((post) => ({
      _id: post._id,
      date: post.date,
      title: post.title,
      location: post.location,
      images: [post.images[0]],
      ownerId: post.ownerId,
    }));
    res.status(200).json(postingPreviews);
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
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// PATCH
router.patch("/:userId", async (req, res) => {
  const body = req.body;

  try {
    if (body.postalCode) {
      const location = await LocationUtil.getLocationByPostalCode(
        body.postalCode
      );
      body.location = location;

      await Posting.updateMany(
        {
          ownerId: req.params.userId,
          active: true,
        },
        {
          location: location,
        }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: body },
      { new: true }
    );
    const token = jwt.sign(updatedUser.toJSON(), process.env.TOKEN_SECRET);
    res.header("auth-token", token);
    res.status(200).json({
      body,
      token,
    });
  } catch (err) {
    if (err == "No results found") {
      res.status(400).json({
        message: "Error code 400: No results returned by postal code",
      });
    } else {
      res.status(500).json({
        message: "Error code 500: Failed to process request",
      });
    }
  }
});

module.exports = router;
