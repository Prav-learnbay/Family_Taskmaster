import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertEventSchema, insertFamilySchema } from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Mock user data for the demo - in a real app this would come from authentication
  const DEMO_USER = {
    id: "demo-user-1",
    email: "demo@example.com",
    firstName: "Demo",
    lastName: "User",
    profileImageUrl: null,
    role: "parent" as const,
    familyId: "demo-family-1"
  };

  const DEMO_FAMILY = {
    id: "demo-family-1",
    name: "Demo Family",
    createdBy: "demo-user-1"
  };

  // Initialize demo data if not exists
  app.use(async (req, res, next) => {
    try {
      const existingUser = await storage.getUser(DEMO_USER.id);
      if (!existingUser) {
        // Create demo user first
        await storage.upsertUser(DEMO_USER);
        // Then create demo family
        await storage.createFamily(DEMO_FAMILY);
        // Update user with family ID
        await storage.upsertUser({ ...DEMO_USER, familyId: DEMO_FAMILY.id });
      }
    } catch (error) {
      console.log("Demo data already exists or error:", error);
    }
    next();
  });

  // Auth routes (simplified for demo)
  app.get('/api/auth/user', async (req, res) => {
    try {
      const user = await storage.getUser(DEMO_USER.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Family routes
  app.post('/api/families', async (req, res) => {
    try {
      const familyData = insertFamilySchema.parse({
        ...req.body,
        id: nanoid(),
        createdBy: DEMO_USER.id,
      });
      
      const family = await storage.createFamily(familyData);
      res.status(201).json(family);
    } catch (error) {
      console.error("Error creating family:", error);
      res.status(500).json({ message: "Failed to create family" });
    }
  });

  app.get('/api/families/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const family = await storage.getFamily(id);
      if (!family) {
        return res.status(404).json({ message: "Family not found" });
      }
      res.json(family);
    } catch (error) {
      console.error("Error fetching family:", error);
      res.status(500).json({ message: "Failed to fetch family" });
    }
  });

  app.get('/api/families/:id/members', async (req, res) => {
    try {
      const { id } = req.params;
      const members = await storage.getFamilyMembers(id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching family members:", error);
      res.status(500).json({ message: "Failed to fetch family members" });
    }
  });

  app.get('/api/families/:id/stats', async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await storage.getFamilyStats(id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching family stats:", error);
      res.status(500).json({ message: "Failed to fetch family stats" });
    }
  });

  // Task routes
  app.post('/api/tasks', async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse({
        ...req.body,
        createdBy: DEMO_USER.id,
        familyId: DEMO_USER.familyId,
        assigneeId: req.body.assigneeId || DEMO_USER.id,
      });
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get('/api/tasks', async (req, res) => {
    try {
      const { quadrant, status } = req.query;
      
      if (quadrant) {
        const tasks = await storage.getTasksByQuadrant(DEMO_USER.familyId, parseInt(quadrant as string));
        return res.json(tasks);
      }
      
      let tasks = await storage.getFamilyTasks(DEMO_USER.familyId);
      
      if (status) {
        tasks = tasks.filter(task => task.status === status);
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getTask(parseInt(id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const task = await storage.updateTask(parseInt(id), updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.put('/api/tasks/:id/complete', async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.completeTask(parseInt(id), DEMO_USER.id);
      res.json(task);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTask(parseInt(id));
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Event routes
  app.post('/api/events', async (req, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        createdBy: DEMO_USER.id,
        familyId: DEMO_USER.familyId,
      });
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get('/api/events', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (startDate && endDate) {
        const events = await storage.getEventsForDateRange(
          DEMO_USER.familyId,
          new Date(startDate as string),
          new Date(endDate as string)
        );
        return res.json(events);
      }
      
      const events = await storage.getFamilyEvents(DEMO_USER.familyId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const event = await storage.getEvent(parseInt(id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.put('/api/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const event = await storage.updateEvent(parseInt(id), updates);
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEvent(parseInt(id));
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Achievement routes
  app.get('/api/achievements', async (req, res) => {
    try {
      const achievements = await storage.getUserAchievements(DEMO_USER.id);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Notification routes
  app.get('/api/notifications', async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(DEMO_USER.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(parseInt(id));
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}