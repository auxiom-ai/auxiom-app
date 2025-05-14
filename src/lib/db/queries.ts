import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import { emails, podcasts, users, type NewUser } from './schema';

export async function getUser() {
  // TODO: Implement proper user session management
  // This is a placeholder that should be replaced with your actual session management
  const userId = 1; // Replace with actual user ID from session
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  return await db.select().from(users).where(eq(users.email, email)).limit(1);
}

export async function createUser(user: NewUser) {
  return await db.insert(users).values(user).returning();
}

export async function updateUser(userId: number, data: Partial<NewUser>) {
  return await db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
}

export async function addEmailToNewsletter(email: string) {
  return await db.insert(emails).values({ email }).returning();
}

export async function updateListened(podcastId: number) {
  return await db.update(podcasts)
    .set({ listened: true })
    .where(eq(podcasts.id, podcastId))
    .returning();
} 