import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Hashed
  role: text("role", { enum: ["admin", "moderator", "user"] }).default("user").notNull(),
  displayName: text("display_name"), // For animated/special names
  tag: text("tag"), // "MOD", "VIP", etc.
  tagColor: text("tag_color"), // CSS color or class for animation
  avatarUrl: text("avatar_url"),
  isEmployeeOfMonth: boolean("is_employee_of_month").default(false),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  replyToId: integer("reply_to_id"),
  createdAt: timestamp("created_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // "games", "movies", "custom-1"
  title: text("title").notNull(),
  content: text("content"), // HTML or Embed code
  type: text("type", { enum: ["game", "movie", "custom"] }).notNull(),
  isVisible: boolean("is_visible").default(true),
  order: integer("order").default(0),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  date: timestamp("date").notNull(),
  likes: integer("likes").default(0), // Simple counter for now, or use relation for user-specific likes
  likedBy: jsonb("liked_by").$type<number[]>().default([]), // Array of user IDs
});

export const pkBattles = pgTable("pk_battles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url"),
  roomId: text("room_id").notNull(),
  playerCount: integer("player_count").default(2), // 2-10
  maxPlayers: integer("max_players").default(10),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  active: boolean("active").default(true),
});

// === RELATIONS ===

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
    relationName: "reply",
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isDeleted: true });
export const insertPageSchema = createInsertSchema(pages).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, likes: true, likedBy: true });
export const insertPkBattleSchema = createInsertSchema(pkBattles).omit({ id: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true });

// === EXPLICIT API TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Message = typeof messages.$inferSelect & { user?: User, replyTo?: Message };
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type PkBattle = typeof pkBattles.$inferSelect;
export type InsertPkBattle = z.infer<typeof insertPkBattleSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

// API Requests/Responses
export type LoginRequest = { username: string; password: string };
export type CreateUserRequest = InsertUser; // Admin creates users
export type UpdateUserRequest = Partial<InsertUser>;

export type CreateMessageRequest = { content: string; replyToId?: number };
export type UpdateMessageRequest = { content: string }; // Only editing own message content

export type EventLikeRequest = { eventId: number };
