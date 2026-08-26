import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const leadSchema = z.object({
  name: z.string().min(1, "Lead name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().nullish(),
  company: z.string().nullish(),
  website: z.string().nullish(),
  status: z.enum(["NEW", "CONTACTED", "REPLIED", "WON", "LOST"]),
  source: z.string().nullish(),
  notes: z.string().nullish(),
});

export const settingsSchema = z.object({
  name: z.string().min(2, "Name is required"),
  smtpHost: z.string().nullish(),
  smtpPort: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().nullish()
  ),
  smtpUser: z.string().nullish(),
  smtpPass: z.string().nullish(),
});