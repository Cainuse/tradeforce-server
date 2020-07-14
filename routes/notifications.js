const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const joi = require("@hapi/joi");

const notificationValidation = joi.object({
  userId: joi.string().required(),
  type: joi.string().required(),
  isRead: joi.boolean(),
  date: joi.date(),
  content: joi.string().required().max(200),
});

const updateNotificationValidation = joi.object({
  isRead: joi.boolean().required(),
});

// http://localhost/api/notifications ///////////////////////////////////////////////////////
// GET
// Returns all notifications

router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.get("/findById/:notificationId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      _id: req.params.notificationId,
    });
    res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.get("/findByUserId/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId,
    });
    res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.post("/", async (req, res) => {
  const reqBody = req.body;

  const { error } = notificationValidation.validate(reqBody);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  try {
    const notification = new Notification({
      userId: reqBody.userId,
      type: reqBody.type,
      content: reqBody.content,
    });
    const savedNotification = await notification.save();
    res.status(200).json(savedNotification);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.patch("/updateOneNotification/:notificationId", async (req, res) => {
  const reqBody = req.body;

  const { error } = updateNotificationValidation.validate(reqBody);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  try {
    const updatedNotification = await Notification.updateOne(
      { _id: req.params.notificationId },
      { $set: reqBody } // req.body must be {isRead : true} or {isRead : false}
    );
    res.status(200).json(updatedNotification);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.patch("/updateUserNotifications/:userId", async (req, res) => {
  const reqBody = req.body;

  const { error } = updateNotificationValidation.validate(reqBody);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  try {
    const updatedNotifications = await Notification.updateMany(
      { userId: req.params.userId },
      { $set: reqBody } // req.body must be {isRead : true} or {isRead : false}
    );
    res.status(200).json(updatedNotifications);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

// DELETE
router.delete("/removeOneNotification/:notificationId", async (req, res) => {
  try {
    await Notification.deleteOne({
      _id: req.params.notificationId,
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

router.delete("/removeUserNotifications/:userId", async (req, res) => {
  try {
    await Notification.deleteMany({
      userId: req.params.userId,
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      message: "Error code 500: Failed to process request",
    });
  }
});

module.exports = router;
