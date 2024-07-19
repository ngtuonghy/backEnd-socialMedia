let user = new Map();

const addUser = (userId, socketId) => {
	user.set(userId, socketId);
};

const removeUser = (socketId) => {
	for (const [key, value] of user.entries()) {
		if (value === socketId) {
			user.delete(key);
			break;
		}
	}
};

const getUser = (userId) => {
	return user.get(userId);
};

export { addUser, removeUser, getUser, user };
