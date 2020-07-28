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

  const findCond = {
    $or: [
      {
        $and: [
          {
            toUserId: fromUserId,
          },
          {
            fromUserId: toUserId,
          },
        ],
      },
      {
        $and: [
          {
            toUserId: toUserId,
          },
          {
            fromUserId: fromUserId,
          },
        ],
      },
    ],
  };

  try {
    const messages = await Message.find(findCond);
    res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.get("/allMsgs", async (req, res) => {
  try {
    const savedMsgs = await Message.find();
    res.status(200).json(savedMsgs);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.post("/", async (req, res) => {
  const reqBody = req.body;

  try {
    const fromUserId = reqBody.fromUserId;
    const toUserId = reqBody.toUserId;
    const fromUserName = reqBody.fromUserName;
    const toUserName = reqBody.toUserName;
    const content = reqBody.content;

    const message = new Message({
      fromUserName,
      toUserName,
      fromUserId,
      toUserId,
      content,
    });
    const savedMsg = await message.save();
    res.status(200).json(savedMsg);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

module.exports = router;
