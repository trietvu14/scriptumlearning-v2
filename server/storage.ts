import { 
  users, 
  tenants, 
  userInvitations,
  type User, 
  type InsertUser, 
  type Tenant, 
  type InsertTenant,
  type UserInvitation,
  type InsertUserInvitation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt } from "drizzle-orm";

// Storage interface definition
interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getUsersByTenant(tenantId: string): Promise<User[]>;
  getAllUsersWithTenantInfo(): Promise<(User & { tenantName: string; tenantDomain: string })[]>;
  
  // Tenant management
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantByDomain(domain: string): Promise<Tenant | undefined>;
  createTenant(insertTenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;
  
  // User invitations
  createUserInvitation(insertInvitation: InsertUserInvitation): Promise<UserInvitation>;
  getUserInvitationByToken(token: string): Promise<UserInvitation | undefined>;
  getInvitationsByTenant(tenantId: string): Promise<UserInvitation[]>;
  acceptInvitation(token: string): Promise<UserInvitation | undefined>;
  deleteInvitation(id: string): Promise<void>;
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  // User management methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUsersByTenant(tenantId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.tenantId, tenantId));
  }

  async getAllUsersWithTenantInfo(): Promise<(User & { tenantName: string; tenantDomain: string })[]> {
    return await db
      .select({
        id: users.id,
        tenantId: users.tenantId,
        email: users.email,
        username: users.username,
        password: users.password,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        title: users.title,
        department: users.department,
        phoneNumber: users.phoneNumber,
        officeLocation: users.officeLocation,
        bio: users.bio,
        profileImageUrl: users.profileImageUrl,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        tenantName: tenants.name,
        tenantDomain: tenants.domain
      })
      .from(users)
      .innerJoin(tenants, eq(users.tenantId, tenants.id));
  }

  // Tenant management methods
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async getTenantByDomain(domain: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.domain, domain));
    return tenant || undefined;
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db
      .insert(tenants)
      .values(insertTenant)
      .returning();
    return tenant;
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined> {
    const [tenant] = await db
      .update(tenants)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return tenant || undefined;
  }

  async getAllTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants);
  }

  // User invitation methods
  async createUserInvitation(insertInvitation: InsertUserInvitation): Promise<UserInvitation> {
    const [invitation] = await db
      .insert(userInvitations)
      .values(insertInvitation)
      .returning();
    return invitation;
  }

  async getUserInvitationByToken(token: string): Promise<UserInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(userInvitations)
      .where(and(
        eq(userInvitations.invitationToken, token),
        eq(userInvitations.isAccepted, false),
        gt(userInvitations.expiresAt, new Date())
      ));
    return invitation || undefined;
  }

  async getInvitationsByTenant(tenantId: string): Promise<UserInvitation[]> {
    return await db
      .select()
      .from(userInvitations)
      .where(eq(userInvitations.tenantId, tenantId));
  }

  async acceptInvitation(token: string): Promise<UserInvitation | undefined> {
    const [invitation] = await db
      .update(userInvitations)
      .set({ 
        isAccepted: true, 
        acceptedAt: new Date() 
      })
      .where(eq(userInvitations.invitationToken, token))
      .returning();
    return invitation || undefined;
  }

  async deleteInvitation(id: string): Promise<void> {
    await db.delete(userInvitations).where(eq(userInvitations.id, id));
  }
}

export const storage = new DatabaseStorage();