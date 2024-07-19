import { Router } from "express";
import v1 from "#src/api/v1/index";

const api = Router();
api.use("/api/v1", v1);
export default api;
