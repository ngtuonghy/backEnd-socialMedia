export default function commentHandlers(io, socket) {
	const createOrder = (payload) => {
		// Xử lý logic khi tạo order
		console.log("Creating order:", payload);
		// Ví dụ: lưu order vào cơ sở dữ liệu
		// Gửi thông báo tới tất cả clients rằng có order mới được tạo
		io.emit("order:created", payload);
	};

	const readOrder = (orderId, callback) => {
		// Xử lý logic khi đọc order
		console.log("Reading order:", orderId);
		// Ví dụ: truy vấn order từ cơ sở dữ liệu và gửi kết quả về client
		const order = { id: orderId, status: "completed" };
		callback(order);
	};

	socket.on("comment:create", createOrder);
	socket.on("order:read", readOrder);
}
