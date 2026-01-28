import { z } from "zod";

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const adminLoginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ==================== USER SCHEMAS ====================

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  bio: z.string().max(160, "Bio must be at most 160 characters").optional(),
  location: z.string().max(100, "Location must be at most 100 characters").optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  favoriteTeam: z.string().optional(),
  favoritePlayer: z.string().optional(),
});

// ==================== POST SCHEMAS ====================

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content cannot be empty")
    .max(500, "Post content must be at most 500 characters"),
  images: z.array(z.string().url()).max(4, "Maximum 4 images allowed").optional(),
  matchId: z.string().optional(),
  poll: z
    .object({
      options: z
        .array(z.string().min(1).max(50))
        .min(2, "Poll must have at least 2 options")
        .max(4, "Poll can have at most 4 options"),
      expiresIn: z.number().min(1).max(7), // Days
    })
    .optional(),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(300, "Comment must be at most 300 characters"),
  parentId: z.string().optional(),
});

// ==================== SEARCH SCHEMAS ====================

export const searchSchema = z.object({
  query: z.string().min(1, "Search query cannot be empty"),
  type: z.enum(["all", "users", "posts", "hashtags", "matches"]).default("all"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

// ==================== MATCH PREDICTION SCHEMA ====================

export const matchPredictionSchema = z.object({
  matchId: z.string(),
  predictedTeam: z.string(),
  confidence: z.number().min(1).max(100).optional(),
});

// ==================== MATCH SCHEMAS ====================

export const createMatchSchema = z.object({
  matchType: z.enum(["test", "odi", "t20", "t10"]),
  format: z.enum(["international", "domestic", "league"]),
  venue: z.string().min(1, "Venue is required"),
  city: z.string().optional(),
  country: z.string().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date"),
  homeTeamId: z.string().min(1, "Home team is required"),
  awayTeamId: z.string().min(1, "Away team is required"),
  seriesId: z.string().optional(),
  weather: z.string().optional(),
  pitch: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.homeTeamId === data.awayTeamId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Home and away teams must be different",
      path: ["awayTeamId"],
    });
  }
});

// ==================== TYPE EXPORTS ====================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type MatchPredictionInput = z.infer<typeof matchPredictionSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;