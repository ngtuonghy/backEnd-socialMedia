import Multer from "multer";
const storage = new Multer.memoryStorage();
const upload = Multer({
  storage,
});
export default upload;
