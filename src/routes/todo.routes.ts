import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { getTodos, getTodo, createTodo, updateTodo, deleteTodo } from "../controllers/todo.controller";

const router = Router();

router.use(authenticateJWT);

router.get("/", getTodos);
router.get("/:id", getTodo);
router.post("/", createTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;