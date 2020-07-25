const express = require("express");
const router = express.Router();
const joi = require("@hapi/joi");
const Message = require("../models/Message");

const messageValidation = joi.object({
  fromUserId: joi.string().required(),
  toUserId: joi.string().required(),
});

router.get("/", async (req, res) => {
  const reqBody = req.body;

  const { error } = messageValidation.validate(reqBody);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const fromUserId = req.body.fromUserId;
  const toUserId = req.body.toUserId;

  try {
    const messages = await Message.find({ fromUserId, toUserId });
    res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

module.exports = router;
