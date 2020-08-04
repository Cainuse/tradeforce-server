const Notification = require("../models/Notification");

const createNotification = async (userId, type, content) => {
  try {
    await new Notification({
      userId: userId,
      type: type,
      content: content,
      date: new Date(),
    }).save();
  } catch (err) {
    // do nothing, skip creation of notification if fails
    console.log(err);
  }
};

module.exports = createNotification;
