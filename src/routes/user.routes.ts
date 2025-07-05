import { Router } from "express";
import { register, login, getUserByToken } from "../controllers/user.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/get-user", authenticateJWT, getUserByToken);

export default router;
