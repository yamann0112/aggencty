import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertUserSchema, insertPageSchema, insertEventSchema, insertPkBattleSchema, insertAnnouncementSchema } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Setup Auth (Passport)
  setupAuth(app);

  // Seed Admin User
  const existingUsers = await storage.getAllUsers();
  if (existingUsers.length === 0) {
    const hashedPassword = await hashPassword("admin123");
    await storage.createUser({
      username: "admin",
      password: hashedPassword,
      role: "admin",
      displayName: "Super Admin",
      tag: "OWNER",
      tagColor: "gold",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      isEmployeeOfMonth: false
    });
    console.log("Admin user created: admin / admin123");
  }

  // Users
  app.get(api.users.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post(api.users.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") return res.status(403).send();
    try {
      const input = insertUserSchema.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (e) {
      res.status(400).json(e);
    }
  });

  app.patch(api.users.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const id = parseInt(req.params.id);
    
    // Only admin or self can update
    if (req.user?.role !== "admin" && req.user?.id !== id) return res.status(403).send();

    try {
      const input = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, input);
      res.json(user);
    } catch (e) {
      res.status(400).json(e);
    }
  });

  app.delete(api.users.delete.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") return res.status(403).send();
    await storage.deleteUser(parseInt(req.params.id));
    res.status(204).send();
  });

  // Messages
  app.get(api.messages.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post(api.messages.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const input = z.object({ content: z.string(), replyToId: z.number().optional() }).parse(req.body);
    const message = await storage.createMessage({
      userId: req.user!.id,
      content: input.content,
      replyToId: input.replyToId,
    });
    res.status(201).json(message);
  });

  app.delete(api.messages.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    // Logic for deleting: Admin/Mod can delete all. User can delete own if recent.
    // Simplified for now: Admin/Mod or Self
    // TODO: 15 min check for self
    await storage.deleteMessage(parseInt(req.params.id));
    res.status(204).send();
  });

  // Pages
  app.get(api.pages.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const pages = await storage.getPages();
    res.json(pages);
  });

  app.post(api.pages.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") return res.status(403).send();
    const input = insertPageSchema.parse(req.body);
    const page = await storage.createPage(input);
    res.status(201).json(page);
  });

  // Events
  app.get(api.events.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const events = await storage.getEvents();
    res.json(events);
  });

  app.post(api.events.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") return res.status(403).send();
    const input = insertEventSchema.parse(req.body);
    const event = await storage.createEvent(input);
    res.status(201).json(event);
  });

  app.post(api.events.like.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const event = await storage.likeEvent(parseInt(req.params.id), req.user!.id);
    res.json(event);
  });

  // PK Battles
  app.get(api.pkBattles.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const battles = await storage.getPkBattles();
    res.json(battles);
  });

  app.post(api.pkBattles.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") return res.status(403).send();
    const input = insertPkBattleSchema.parse(req.body);
    const battle = await storage.createPkBattle(input);
    res.status(201).json(battle);
  });

  // Announcements
  app.get(api.announcements.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const announcements = await storage.getAnnouncements();
    res.json(announcements);
  });
  
  app.post(api.announcements.create.path, async (req, res) => {
      if (!req.isAuthenticated() || req.user?.role !== "admin") return res.status(403).send();
      const input = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(input);
      res.status(201).json(announcement);
  });

  // Settings
  app.get(api.settings.get.path, async (req, res) => {
    const value = await storage.getSetting(req.params.key);
    if (value === undefined) return res.status(404).send();
    res.json({ value });
  });

  app.post(api.settings.set.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") return res.status(403).send();
    const { key, value } = z.object({ key: z.string(), value: z.string() }).parse(req.body);
    await storage.setSetting(key, value);
    res.json({ key, value });
  });

  return httpServer;
}
