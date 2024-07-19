import env from "#src/config/env";
import * as user from "#src/models/userManager";
import { Server } from "socket.io";

export default function socketLoader(httpServer) {
	const io = new Server(httpServer, {
		cors: {
			origin: env.APP_URL,
			credentials: true,
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (socket) => {
		socket.on("addUser", (userId) => {
			user.addUser(userId, socket.id);
			// console.log(user.user);
		});
		socket.on("disconnect", () => {
			user.removeUser(socket.id);
			// console.log(user.user);
		});
		//
		socket.on("new-comment", (msg) => {
			socket.broadcast.emit("new-comment", msg);
		});
		//
		socket.on("replied-comment", (msg) => {
			socket.broadcast.emit("replied-comment", msg);
			// console.log(msg);
		});
		//
		socket.on("send-notification", (msg) => {
			const receiver = user.getUser(msg.receiverId);
			if (receiver) {
				socket.to(receiver).emit("get-notification", msg);
			}
		});
		//
	});
}
