import { Request, Response, NextFunction } from "express";
import { Todo } from "../models/todo.model";
import { User } from "../models/user.model";

export const getTodos = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;
  // const todos = await Todo.find({ user: userId });
  const todos = await Todo.find({ user: userId }).populate('user');
  res.json(todos);
};

export const getTodo = async (req: Request, res: Response, next: NextFunction) => {
  const todo = await Todo.findOne({ _id: req.params.id, user: req.userId });
  if (!todo) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }
  res.json(todo);
};

export const createTodo = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, completed } = req.body;
  try {
    const todo = new Todo({ title, description, completed, user: req.userId });
    const newTodo = await todo.save();
    await User.findByIdAndUpdate(req.userId, { $push: { todos: newTodo._id } });
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const updateTodo = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const update = req.body;
  const todo = await Todo.findOneAndUpdate({ _id: id, user: req.userId }, update, { new: true });
  if (!todo) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }
  res.json(todo);
};

export const deleteTodo = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const todo = await Todo.findOneAndDelete({ _id: id, user: req.userId });
  if (!todo) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }
  await User.findByIdAndUpdate(req.userId, { $pull: { todos: id } });
  res.json({ message: "Todo deleted" });
}; 