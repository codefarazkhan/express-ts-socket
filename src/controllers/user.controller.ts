import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import omit from "lodash/omit";
import { Address } from "../models/address.model";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, email, age, password, address } = req.body;

  try {
    // Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors: {
          name: !name ? "Name is required" : undefined,
          email: !email ? "Email is required" : undefined,
          password: !password ? "Password is required" : undefined,
        },
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
      return;
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      name,
      email,
      age: age || undefined,
      password: hashedPassword,
      todos: [],
    });

    const newUser = await user.save();

    if (address) {
      const newAddress = new Address({
        street: address.street,
        city: address.city,
        user: newUser._id,
      });
      await newAddress.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || "fallback_secret"
    );

    // Remove password from response
    const userObj = omit(newUser.toObject(), ["password"]);

    // Success response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userObj,
        token,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? (err as Error).message
          : undefined,
    });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
        errors: {
          email: !email ? "Email is required" : undefined,
          password: !password ? "Password is required" : undefined,
        },
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret"
    );

    // Remove password from response
    const userObj = omit(user.toObject(), ["password"]);

    // Success response
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userObj,
        token,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? (err as Error).message
          : undefined,
    });
  }
};

export const getUserByToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  res.json(user);
};