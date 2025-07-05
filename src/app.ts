import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes";
import todoRoutes from "./routes/todo.routes";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/todos", todoRoutes);

export default app;
