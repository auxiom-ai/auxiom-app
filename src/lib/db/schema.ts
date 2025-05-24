import { boolean, integer, json, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  occupation: text('occupation'),
  industry: text('industry'),
  role: text('role'),
  keywords: json('keywords').$type<string[]>(),
  deliveryDay: integer('delivery_day').default(0),
  plan: text('plan').default('free'),
  active: boolean('active').default(false),
  verified: boolean('verified').default(false),
  delivered: timestamp('delivered'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeProductId: text('stripe_product_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const podcasts = pgTable('podcasts', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  url: text('url').notNull(),
  listened: boolean('listened').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emails = pgTable('emails', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert; 