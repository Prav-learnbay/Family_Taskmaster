import {
  users,
  families,
  tasks,
  events,
  achievements,
  notifications,
  type User,
  type UpsertUser,
  type Family,
  type InsertFamily,
  type Task,
  type InsertTask,
  type Event,
  type InsertEvent,
  type Achievement,
  type InsertAchievement,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Family operations
  createFamily(family: InsertFamily): Promise<Family>;
  getFamily(id: string): Promise<Family | undefined>;
  getFamilyMembers(familyId: string): Promise<User[]>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  getTask(id: number): Promise<Task | undefined>;
  getFamilyTasks(familyId: string): Promise<Task[]>;
  getUserTasks(userId: string): Promise<Task[]>;
  getTasksByQuadrant(familyId: string, quadrant: number): Promise<Task[]>;
  completeTask(id: number, userId: string): Promise<Task>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  getEvent(id: number): Promise<Event | undefined>;
  getFamilyEvents(familyId: string): Promise<Event[]>;
  getUserEvents(userId: string): Promise<Event[]>;
  getEventsForDateRange(familyId: string, startDate: Date, endDate: Date): Promise<Event[]>;
  
  // Achievement operations
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Analytics operations
  getFamilyStats(familyId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    completedToday: number;
    dueThisWeek: number;
    completionRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Family operations
  async createFamily(familyData: InsertFamily): Promise<Family> {
    const [family] = await db
      .insert(families)
      .values(familyData)
      .returning();
    return family;
  }

  async getFamily(id: string): Promise<Family | undefined> {
    const [family] = await db.select().from(families).where(eq(families.id, id));
    return family;
  }

  async getFamilyMembers(familyId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.familyId, familyId));
  }

  // Task operations
  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(taskData)
      .returning();
    return task;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getFamilyTasks(familyId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.familyId, familyId))
      .orderBy(desc(tasks.createdAt));
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.assigneeId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByQuadrant(familyId: string, quadrant: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.familyId, familyId), eq(tasks.quadrant, quadrant)))
      .orderBy(desc(tasks.createdAt));
  }

  async completeTask(id: number, userId: string): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ 
        status: "completed", 
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();

    // Award points if task has points and user is a child
    if (task.points && task.points > 0) {
      const user = await this.getUser(userId);
      if (user && user.role === "child") {
        await db
          .update(users)
          .set({ 
            gamificationPoints: sql`${users.gamificationPoints} + ${task.points}`,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));
      }
    }

    return task;
  }

  // Event operations
  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(eventData)
      .returning();
    return event;
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getFamilyEvents(familyId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.familyId, familyId))
      .orderBy(events.startTime);
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(sql`${events.attendees} @> ${JSON.stringify([userId])}`)
      .orderBy(events.startTime);
  }

  async getEventsForDateRange(familyId: string, startDate: Date, endDate: Date): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.familyId, familyId),
          gte(events.startTime, startDate),
          lte(events.endTime, endDate)
        )
      )
      .orderBy(events.startTime);
  }

  // Achievement operations
  async createAchievement(achievementData: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(achievementData)
      .returning();
    return achievement;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Analytics operations
  async getFamilyStats(familyId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    completedToday: number;
    dueThisWeek: number;
    completionRate: number;
  }> {
    const familyTasks = await this.getFamilyTasks(familyId);
    const totalTasks = familyTasks.length;
    const completedTasks = familyTasks.filter(task => task.status === "completed").length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const completedToday = familyTasks.filter(task => 
      task.completedAt && 
      task.completedAt >= today && 
      task.completedAt < tomorrow
    ).length;

    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    
    const dueThisWeek = familyTasks.filter(task => 
      task.dueDate && 
      task.status !== "completed" && 
      task.dueDate <= oneWeekFromNow
    ).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      completedToday,
      dueThisWeek,
      completionRate,
    };
  }
}

export const storage = new DatabaseStorage();
