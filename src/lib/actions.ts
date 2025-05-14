'use server';

import { db } from '@/lib/db/drizzle';
import { addEmailToNewsletter, getUser, updateListened } from '@/lib/db/queries';
import {
    emails,
    podcasts,
    User
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

// Get user profile information
export async function getUserProfile(): Promise<Partial<User> | null> {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    occupation: user.occupation,
    industry: user.industry,
    role: user.role,
    plan: user.plan,
    active: user.active,
    verified: user.verified
  };
}

// Get user's keywords/interests
export async function getUserKeywords(): Promise<string[]> {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  return Array.isArray(user.keywords) ? user.keywords : [];
}

// Get user's delivery day preference
export async function getUserDeliveryDay(): Promise<number> {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  return user.deliveryDay;
}

// Get user's delivery status
export async function getUserDeliveryStatus(): Promise<boolean> {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const now = new Date();
  const lastSunday = new Date();
  lastSunday.setDate(now.getDate() - (now.getDay() + 1));

  return user.delivered >= lastSunday;
}

// Get user's account status
export async function getUserAccountStatus(): Promise<boolean> {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  return user.active;
}

// Get user's current subscription plan
export async function getUserPlan(): Promise<string> {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  return user.plan;
}

// Get user's podcasts
export async function getUserPodcasts() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const userPodcasts = await db.select().from(podcasts).where(eq(podcasts.user_id, user.id));
  return userPodcasts;
}

// Update user's listened status for a podcast
export async function updatePodcastListenedStatus(podcastId: number) {
  const res = await updateListened(podcastId);

  if (res.length === 0) {
    return { error: 'Podcast not found.' };
  } else {
    return { success: 'Podcast marked as listened.' };
  }
}

// Get user's newsletter subscription status
export async function getNewsletterStatus(): Promise<boolean> {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const emailRecord = await db.select().from(emails).where(eq(emails.email, user.email)).limit(1);
  return emailRecord.length > 0;
}

// Add user to newsletter
export async function subscribeToNewsletter() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  try {
    await addEmailToNewsletter(user.email);
    return { success: 'Successfully subscribed to newsletter.' };
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return { error: 'Failed to subscribe to newsletter.' };
  }
}

// Get user's verification status
export async function getVerificationStatus(): Promise<boolean> {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  return user.verified;
}

// Get user's onboarding completion status
export async function getOnboardingStatus(): Promise<boolean> {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  return !!(user.name && user.occupation && Array.isArray(user.keywords) && user.keywords.length >= 5);
} 