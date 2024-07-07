import expressLoader from "./expressLoader.js";
import redisLoader from "./redisLoader.js";
import socketLoader from "./socketLoader.js";
const loader = async (app, httpServer) => {
  redisLoader();
  expressLoader(app);
  socketLoader(httpServer);
};
export default loader;
