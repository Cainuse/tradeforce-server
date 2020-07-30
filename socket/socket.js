const User = require("../models/User").User;
const Message = require("../models/Message");

const socketEvents = (io) => {
  io.on("connection", (socket) => {
    /* Get the user's Chat list	*/
    // go to messages collection, match userId to fromUserId or toUserId to to
    // find who the current user has interacted with, extract all those userIds
    // and send them back, indicating all contacts
    socket.on(`chat-list`, async (data) => {
      if (data.userId == "") {
        io.emit(`chat-list-response`, {
          error: true,
          message: "User not found",
        });
      } else {
        try {
          const chatlistResponse = await getChatList(data.userId);

          // this emit is returning the currentUser's chat list to themselves
          io.to(socket.id).emit(`chat-list-response`, {
            error: false,
            chatList: chatlistResponse,
          });
        } catch (error) {
          io.to(socket.id).emit(`chat-list-response`, {
            error: true,
            chatList: [],
          });
        }
      }
    });

    /**
     * send the messages to the user
     */
    socket.on(`add-message`, async (data) => {
      if (data.message === "") {
        io.to(socket.id).emit(`add-message-response`, {
          error: true,
          message: "Message not found",
        });
      } else if (data.fromUserId === "") {
        io.to(socket.id).emit(`add-message-response`, {
          error: true,
          message:
            "server cannot process the request since requested fromUserId is missing from data",
        });
      } else if (data.toUserId === "") {
        io.to(socket.id).emit(`add-message-response`, {
          error: true,
          message:
            "server cannot process the request since requested toUserId is missing from data",
        });
      } else {
        try {
          const [toSocketId, messageResult] = await Promise.all([
            getUserSocketId(data.toUserId),
            insertMessages(data),
          ]);
          io.to(toSocketId.socketId).emit(`add-message-response`, {
            error: false,
            chatMsg: messageResult.chatMsg,
          });
        } catch (error) {
          io.to(socket.id).emit(`add-message-response`, {
            error: true,
            message:
              "Failed to add messages to the db or retrieve user socket info.",
          });
        }
      }
    });

    // data needs to have userId of user whose status changed (online/offline)
    // and the status to change it to, online = true, offline = false
    socket.on("status-change", async (data) => {
      const userId = data.userId;
      try {
        const userInfo = await getUserInfo(userId);
        // broadcast to all users who have this user in their chat list that
        // the user has changed status to either online or offline
        socket.broadcast.emit(`status-change-response`, {
          error: false,
          userOnline: data.status,
          userInfo,
        });
      } catch (err) {
        io.to(socket.id).emit(`status-change-response`, {
          error: true,
          message: `Failed to update the user status to ${data.status}`,
          userId,
        });
      }
    });

    /**
     * Set user to offline (logout of socket)
     */
    socket.on("logout", async (data) => {
      const userId = data.userId;
      try {
        await logout(userId);

        io.to(socket.id).emit(`logout-response`, {
          error: false,
          message: "User is now offline",
          userId,
        });
      } catch (error) {
        io.to(socket.id).emit(`logout-response`, {
          error: true,
          message: "Failed to set user to offline",
          userId,
        });
      }
    });

    socket.on("disconnect", async () => {
      const userId = socket.request._query["userId"];
      try {
        const userInfo = await getUserInfo(userId);
        // broadcast to all users who have this user in their chat list that
        // the user has changed status to either online or offline
        socket.broadcast.emit(`status-change-response`, {
          error: false,
          userOnline: false,
          userInfo,
        });
      } catch (err) {
        io.to(socket.id).emit(`status-change-response`, {
          error: true,
          message: `Failed to update the user status to ${data.status}`,
          userId,
        });
      }
    });
  });
};

const logout = async (userId) => {
  try {
    const updateCond = {
      $set: {
        isOnline: false,
      },
    };
    await User.updateOne({ _id: userId }, updateCond);
  } catch (err) {
    return {
      error: true,
      message: "Failed to update the user status to offline.",
    };
  }
};

const getChatList = async (userId) => {
  try {
    const findCond = {
      $or: [
        {
          toUserId: userId,
        },
        {
          fromUserId: userId,
        },
      ],
    };
    const messages = await Message.find(findCond);
    const usersInteractedWith = messages.map((msgObj) => {
      return msgObj.toUserId === userId ? msgObj.fromUserId : msgObj.toUserId;
    });
    const uniqueChatlistUserIds = [...new Set(usersInteractedWith)];
    const uniqueChatList = [];
    for (const userId of uniqueChatlistUserIds) {
      const userInfo = await getUserInfo(userId);
      if (userInfo.error) {
        throw new Error();
      }
      uniqueChatList.push(userInfo.user);
    }
    return {
      error: false,
      chatList: uniqueChatList,
    };
  } catch (err) {
    return {
      error: true,
      message: `Failed to find any messages involving userId ${userId}`,
    };
  }
};

const getUserInfo = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId }).select(
      "userName isOnline socketId profilePic firstName lastName"
    );
    return {
      error: false,
      user,
    };
  } catch (err) {
    return {
      error: true,
      message: `The userId ${userId} does not match any records in the db.`,
    };
  }
};

const insertMessages = async (msgData) => {
  try {
    const message = new Message({
      fromUserId: msgData.fromUserId,
      toUserId: msgData.toUserId,
      content: msgData.content,
    });
    const savedMsg = await message.save();
    return {
      error: false,
      chatMsg: savedMsg,
    };
  } catch (err) {
    return {
      error: true,
      message: "Failed to save the message in the db.",
    };
  }
};

const getUserSocketId = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });
    return {
      error: false,
      socketId: user.socketId,
    };
  } catch (err) {
    return {
      error: true,
      message: `The userId ${userId} does not match any records in the db.`,
    };
  }
};

const addSocketId = async (userId, socketId) => {
  try {
    const updateObj = {
      $set: {
        socketId,
        isOnline: true,
      },
    };
    await User.updateOne({ _id: userId }, updateObj);
    return {
      error: false,
    };
  } catch (err) {
    return {
      error: true,
      message: `The userId ${userId} does not match any records in the db.`,
    };
  }
};

const setupSocket = (receivedSocket) => {
  const io = receivedSocket;
  io.use(async (socket, next) => {
    const updateSocketResp = await addSocketId(
      socket.request._query["userId"],
      socket.id
    );
    if (updateSocketResp.error) {
      throw new Error(updateSocketResp.message);
    }
    next();
  });

  socketEvents(io);
};

module.exports.setupSocket = setupSocket;
