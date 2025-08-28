import { Router } from "express";
import { eq, and, desc, sql, or, isNull } from "drizzle-orm";
import { db } from "../db";
import { 
  notifications, 
  notificationRecipients,
  users,
  tenants,
  insertNotificationSchema,
  type SelectNotification,
  type InsertNotification
} from "../../shared/schema";
import { requireAuth, requireRole } from "../middleware/auth";
import { sendEmail } from "../services/email";

const router = Router();

// Get notifications for current user
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get direct notifications and tenant-wide notifications
    const userNotifications = await db
      .select({
        id: notifications.id,
        fromUserId: notifications.fromUserId,
        title: notifications.title,
        message: notifications.message,
        type: notifications.type,
        priority: notifications.priority,
        isRead: notifications.isRead,
        actionUrl: notifications.actionUrl,
        expiresAt: notifications.expiresAt,
        createdAt: notifications.createdAt,
        readAt: notifications.readAt,
        fromUser: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        }
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.fromUserId, users.id))
      .where(
        or(
          eq(notifications.toUserId, userId),
          and(
            eq(notifications.tenantId, req.user!.tenantId),
            isNull(notifications.toUserId)
          )
        )
      )
      .orderBy(desc(notifications.createdAt));

    res.json(userNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark notification as read
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user!.id;
    
    const notification = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .then(rows => rows[0]);
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    // Check if user has access to this notification
    if (notification.toUserId !== userId && 
        !(notification.tenantId === req.user!.tenantId && !notification.toUserId)) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(eq(notifications.id, notificationId));
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// Create notification (super admin and school admin only)
router.post("/", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    const notificationData: InsertNotification = {
      ...req.body,
      fromUserId: req.user!.id
    };
    
    // Validate data
    const validatedData = insertNotificationSchema.parse(notificationData);
    
    // School admins can only send notifications within their tenant
    if (req.user!.role === "school_admin") {
      if (validatedData.tenantId && validatedData.tenantId !== req.user!.tenantId) {
        return res.status(403).json({ error: "Can only send notifications within your institution" });
      }
      // Force tenant restriction for school admins
      validatedData.tenantId = req.user!.tenantId;
    }
    
    const notification = await db
      .insert(notifications)
      .values(validatedData)
      .returning()
      .then(rows => rows[0]);
    
    // Send email if specified and user has email
    if (req.body.sendEmail && notification.toUserId) {
      const recipient = await db
        .select()
        .from(users)
        .where(eq(users.id, notification.toUserId))
        .then(rows => rows[0]);
      
      if (recipient?.email) {
        try {
          await sendEmail({
            to: recipient.email,
            subject: `Scriptum Learning: ${notification.title}`,
            text: notification.message,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color: #4338ca;">${notification.title}</h2>
                <p>${notification.message}</p>
                ${notification.actionUrl ? `<p><a href="${notification.actionUrl}" style="background-color: #4338ca; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Take Action</a></p>` : ''}
                <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e5e5;">
                <p style="color: #666; font-size: 12px;">This notification was sent from Scriptum Learning Platform.</p>
              </div>
            `
          });
          
          await db
            .update(notifications)
            .set({ emailSent: true })
            .where(eq(notifications.id, notification.id));
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
        }
      }
    }
    
    res.status(201).json(notification);
  } catch (error: any) {
    console.error("Error creating notification:", error);
    res.status(400).json({ error: error.message || "Failed to create notification" });
  }
});

// Bulk notify tenant users (super admin and school admin only)
router.post("/bulk", requireAuth, requireRole(["super_admin", "school_admin"]), async (req, res) => {
  try {
    const { title, message, type, priority, sendEmail, targetRole, tenantId } = req.body;
    
    if (!title || !message || !type) {
      return res.status(400).json({ error: "Title, message, and type are required" });
    }
    
    let targetTenantId = tenantId;
    
    // School admins can only send to their own tenant
    if (req.user!.role === "school_admin") {
      targetTenantId = req.user!.tenantId;
    }
    
    if (!targetTenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    
    // Get target users
    let targetUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.tenantId, targetTenantId),
          eq(users.isActive, true),
          targetRole ? eq(users.role, targetRole) : undefined
        )
      );
    
    if (targetUsers.length === 0) {
      return res.status(400).json({ error: "No target users found" });
    }
    
    // Create base notification
    const baseNotification = await db
      .insert(notifications)
      .values({
        fromUserId: req.user!.id,
        tenantId: targetTenantId,
        title,
        message,
        type,
        priority: priority || "normal"
      })
      .returning()
      .then(rows => rows[0]);
    
    // Create individual recipient records for tracking
    const recipients = targetUsers.map(user => ({
      notificationId: baseNotification.id,
      userId: user.id
    }));
    
    await db.insert(notificationRecipients).values(recipients);
    
    // Send emails if requested
    if (sendEmail) {
      const emailPromises = targetUsers
        .filter(user => user.email)
        .map(user => 
          sendEmail({
            to: user.email,
            subject: `Scriptum Learning: ${title}`,
            text: message,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color: #4338ca;">${title}</h2>
                <p>${message}</p>
                <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e5e5;">
                <p style="color: #666; font-size: 12px;">This notification was sent to all ${targetRole || 'users'} at your institution from Scriptum Learning Platform.</p>
              </div>
            `
          }).catch((err: any) => console.error(`Failed to send email to ${user.email}:`, err))
        );
      
      await Promise.allSettled(emailPromises);
      
      // Update email sent status
      await db
        .update(notifications)
        .set({ emailSent: true })
        .where(eq(notifications.id, baseNotification.id));
    }
    
    res.status(201).json({
      notification: baseNotification,
      recipientCount: targetUsers.length
    });
  } catch (error: any) {
    console.error("Error creating bulk notification:", error);
    res.status(400).json({ error: error.message || "Failed to create bulk notification" });
  }
});

// Get notification statistics (super admin only)
router.get("/stats", requireAuth, requireRole(["super_admin"]), async (req, res) => {
  try {
    const stats = await db
      .select({
        type: notifications.type,
        priority: notifications.priority,
        count: sql<number>`count(*)`.as('count'),
        unreadCount: sql<number>`count(*) filter (where ${notifications.isRead} = false)`.as('unread_count')
      })
      .from(notifications)
      .groupBy(notifications.type, notifications.priority);
    
    const tenantStats = await db
      .select({
        tenantId: notifications.tenantId,
        tenantName: tenants.name,
        count: sql<number>`count(*)`.as('count')
      })
      .from(notifications)
      .leftJoin(tenants, eq(notifications.tenantId, tenants.id))
      .where(sql`${notifications.tenantId} is not null`)
      .groupBy(notifications.tenantId, tenants.name);
    
    res.json({
      typeStats: stats,
      tenantStats
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({ error: "Failed to fetch notification statistics" });
  }
});

export default router;