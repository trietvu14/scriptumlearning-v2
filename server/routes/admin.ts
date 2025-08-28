import { Router } from "express";
import { eq, and, desc, sql, count, ne } from "drizzle-orm";
import { db } from "../db";
import { 
  users, 
  tenants, 
  standardsFrameworks,
  notifications,
  systemAnalytics
} from "../../shared/schema";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Super Admin Dashboard Statistics
router.get("/dashboard", requireAuth, requireRole(["super_admin"]), async (req, res) => {
  try {
    // Total statistics
    const totalSchools = await db
      .select({ count: count() })
      .from(tenants)
      .where(eq(tenants.isActive, true))
      .then(result => result[0]?.count || 0);

    const totalUsers = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true))
      .then(result => result[0]?.count || 0);

    const totalFrameworks = await db
      .select({ count: count() })
      .from(standardsFrameworks)
      .where(eq(standardsFrameworks.isActive, true))
      .then(result => result[0]?.count || 0);

    // Schools by educational area
    const schoolsByArea = await db
      .select({
        educationalArea: tenants.educationalArea,
        count: count(),
        schools: sql<any[]>`array_agg(${tenants.name})`
      })
      .from(tenants)
      .where(eq(tenants.isActive, true))
      .groupBy(tenants.educationalArea);

    // User distribution by role and tenant
    const usersByRoleAndTenant = await db
      .select({
        tenantId: users.tenantId,
        tenantName: tenants.name,
        educationalArea: tenants.educationalArea,
        role: users.role,
        count: count()
      })
      .from(users)
      .innerJoin(tenants, eq(users.tenantId, tenants.id))
      .where(and(
        eq(users.isActive, true),
        eq(tenants.isActive, true)
      ))
      .groupBy(users.tenantId, tenants.name, tenants.educationalArea, users.role);

    // All schools with details
    const allSchools = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        domain: tenants.domain,
        educationalArea: tenants.educationalArea,
        isActive: tenants.isActive,
        createdAt: tenants.createdAt,
        userCount: sql<number>`(
          SELECT COUNT(*) FROM ${users} 
          WHERE ${users.tenantId} = ${tenants.id} 
          AND ${users.isActive} = true
        )`.as('user_count'),
        adminCount: sql<number>`(
          SELECT COUNT(*) FROM ${users} 
          WHERE ${users.tenantId} = ${tenants.id} 
          AND ${users.role} IN ('school_admin', 'administrative_support')
          AND ${users.isActive} = true
        )`.as('admin_count'),
        facultyCount: sql<number>`(
          SELECT COUNT(*) FROM ${users} 
          WHERE ${users.tenantId} = ${tenants.id} 
          AND ${users.role} = 'faculty'
          AND ${users.isActive} = true
        )`.as('faculty_count'),
        studentCount: sql<number>`(
          SELECT COUNT(*) FROM ${users} 
          WHERE ${users.tenantId} = ${tenants.id} 
          AND ${users.role} = 'student'
          AND ${users.isActive} = true
        )`.as('student_count')
      })
      .from(tenants)
      .orderBy(tenants.name);

    // Recent activity
    const recentNotifications = await db
      .select({
        id: notifications.id,
        title: notifications.title,
        type: notifications.type,
        priority: notifications.priority,
        tenantName: tenants.name,
        createdAt: notifications.createdAt
      })
      .from(notifications)
      .leftJoin(tenants, eq(notifications.tenantId, tenants.id))
      .orderBy(desc(notifications.createdAt))
      .limit(10);

    // System health metrics
    const pendingNotifications = await db
      .select({ count: count() })
      .from(notifications)
      .where(eq(notifications.isRead, false))
      .then(result => result[0]?.count || 0);

    res.json({
      totalStats: {
        totalSchools,
        totalUsers,
        totalFrameworks,
        pendingNotifications
      },
      schoolsByArea,
      usersByRoleAndTenant,
      allSchools,
      recentActivity: recentNotifications
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Get detailed school information
router.get("/schools/:tenantId", requireAuth, requireRole(["super_admin"]), async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    
    const schoolDetails = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .then(rows => rows[0]);
    
    if (!schoolDetails) {
      return res.status(404).json({ error: "School not found" });
    }
    
    const schoolUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.tenantId, tenantId))
      .orderBy(users.role, users.lastName);
    
    const customFrameworks = await db
      .select()
      .from(standardsFrameworks)
      .where(and(
        eq(standardsFrameworks.tenantId, tenantId),
        eq(standardsFrameworks.isActive, true)
      ));
    
    const schoolNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.tenantId, tenantId))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
    
    res.json({
      school: schoolDetails,
      users: schoolUsers,
      customFrameworks,
      notifications: schoolNotifications
    });
  } catch (error) {
    console.error("Error fetching school details:", error);
    res.status(500).json({ error: "Failed to fetch school details" });
  }
});

// Get platform usage analytics
router.get("/analytics", requireAuth, requireRole(["super_admin"]), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysBack = parseInt(period as string);
    
    // User activity over time
    const userActivity = await db
      .select({
        date: sql<string>`DATE(${users.lastLoginAt})`.as('date'),
        activeUsers: sql<number>`COUNT(DISTINCT ${users.id})`.as('active_users')
      })
      .from(users)
      .where(
        and(
          sql`${users.lastLoginAt} >= NOW() - INTERVAL '${daysBack} days'`,
          eq(users.isActive, true)
        )
      )
      .groupBy(sql`DATE(${users.lastLoginAt})`)
      .orderBy(sql`DATE(${users.lastLoginAt})`);
    
    // Frameworks created over time
    const frameworkCreation = await db
      .select({
        date: sql<string>`DATE(${standardsFrameworks.createdAt})`.as('date'),
        count: count()
      })
      .from(standardsFrameworks)
      .where(sql`${standardsFrameworks.createdAt} >= NOW() - INTERVAL '${daysBack} days'`)
      .groupBy(sql`DATE(${standardsFrameworks.createdAt})`)
      .orderBy(sql`DATE(${standardsFrameworks.createdAt})`);
    
    // Tenant growth
    const tenantGrowth = await db
      .select({
        date: sql<string>`DATE(${tenants.createdAt})`.as('date'),
        count: count()
      })
      .from(tenants)
      .where(sql`${tenants.createdAt} >= NOW() - INTERVAL '${daysBack} days'`)
      .groupBy(sql`DATE(${tenants.createdAt})`)
      .orderBy(sql`DATE(${tenants.createdAt})`);
    
    res.json({
      userActivity,
      frameworkCreation,
      tenantGrowth,
      period: daysBack
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

// System health check
router.get("/health", requireAuth, requireRole(["super_admin"]), async (req, res) => {
  try {
    const checks = {
      database: false,
      emailService: false,
      activeUsers: 0,
      systemLoad: "normal"
    };
    
    // Database health
    try {
      await db.select({ count: count() }).from(users).limit(1);
      checks.database = true;
    } catch (error) {
      console.error("Database health check failed:", error);
    }
    
    // Email service health (check if API key is configured)
    checks.emailService = !!process.env.SENDGRID_API_KEY;
    
    // Active users in last 24 hours
    checks.activeUsers = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          sql`${users.lastLoginAt} >= NOW() - INTERVAL '24 hours'`,
          eq(users.isActive, true)
        )
      )
      .then(result => result[0]?.count || 0);
    
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      checks
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "System health check failed"
    });
  }
});

export default router;