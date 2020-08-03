const Notification = require("../models/Notification");

const createNotification = async (userId, type, content) => {
  try {
    const notification = await new Notification({
      userId: userId,
      type: type,
      content: content,
    }).save();
  } catch (err) {
    console.log(err);
  }
};

module.exports = createNotification;
