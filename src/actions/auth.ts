"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema, type RegisterInput } from "@/lib/validations";

export async function registerUser(data: RegisterInput) {
  try {
    // Validate input
    const validatedData = registerSchema.parse(data);

    // Check if username already exists
    const existingUsername = await db.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUsername) {
      return { success: false, error: "Username already taken" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        username: validatedData.username,
        name: validatedData.name,
        password: hashedPassword,
        role: "user",
      },
    });

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function checkUsernameAvailability(username: string) {
  try {
    const existingUser = await db.user.findUnique({
      where: { username },
    });

    return { available: !existingUser };
  } catch (error) {
    console.error("Username check error:", error);
    return { available: false, error: "Failed to check username" };
  }
}

export async function createAdminUser(username: string, password: string, name: string) {
  try {
    // Check if username already exists
    const existingUsername = await db.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return { success: false, error: "Username already taken" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const user = await db.user.create({
      data: {
        username,
        name,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      },
    });

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Admin creation error:", error);
    return { success: false, error: "Failed to create admin user" };
  }
}