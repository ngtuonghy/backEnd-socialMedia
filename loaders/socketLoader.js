import { Server } from "socket.io";
import env from "../config/env.js";

export default function socketLoader(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientPort,
    },
  });

  let users = [];

  const addUser = (userId, socketId) => {
    if (!users.some((user) => user.userId === userId)) {
      users.push({ userId, socketId });
    }
  };

  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };

  const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };

  io.on("connection", (socket) => {
    // console.log("a user connected.: ", socket.id);

    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      // console.log("userCreate :", userId, socket.id);
    });

    socket.on("new-comment", (msg) => {
      io.emit("new-message", msg);
      // console.log(msg);
    });

    socket.on("replied-comment", (msg) => {
      socket.broadcast.emit("replied-comment", msg);
      // console.log(msg);
    });

    socket.on("send-notification", (msg) => {
      const receiver = getUser(msg.receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit("get-notification", msg);
      }
    });

    socket.on("disconnect", () => {
      removeUser(socket.id);
      // console.log("user disconnected");
    });
  });
}
