export default function onConnection(fn) {
	io.on("connection", soc);
}
