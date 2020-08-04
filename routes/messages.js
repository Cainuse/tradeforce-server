const express = require("express");
const router = express.Router();
const joi = require("@hapi/joi");
const Message = require("../models/Message");

const messageValidation = joi.object({
  fromUserId: joi.string().required(),
  toUserId: joi.string().required(),
});

router.get("/", async (req, res) => {
  const reqBody = req.query;

  const { error } = messageValidation.validate(reqBody);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const fromUserId = reqBody.fromUserId;
  const toUserId = reqBody.toUserId;

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
    const content = reqBody.content;

    const message = new Message({
      fromUserId,
      toUserId,
      content,
    });
    const savedMsg = await message.save();
    res.status(200).json(savedMsg);
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.get("/unread/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const totalUnreadCount = await Message.countDocuments({
      toUserId: userId,
      isUnread: true,
    });
    res.status(200).json({ unreadCount: totalUnreadCount });
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.patch("/markAllAsRead", async (req, res) => {
  try {
    const fromUserId = req.body.fromUserId;
    const toUserId = req.body.toUserId;

    await Message.updateMany(
      {
        fromUserId,
        toUserId,
        isUnread: true,
      },
      { isUnread: false }
    );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.patch("/markOneAsRead", async (req, res) => {
  try {
    await Message.updateOne(
      {
        _id: req.body.messageId,
      },
      { isUnread: false }
    );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

module.exports = router;
