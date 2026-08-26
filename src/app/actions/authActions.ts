"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(email: string, password: string) {
  try {
    await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password: password,
      redirect: false,
    });
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password." };
        default:
          return { success: false, error: "Authentication failed. Please try again." };
      }
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}