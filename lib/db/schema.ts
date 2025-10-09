import { pgTable, serial, text, real, timestamp, integer, boolean, pgSchema } from 'drizzle-orm/pg-core';

// Define the poster schema
export const posterSchema = pgSchema('poster');

// Users table for authentication
export const users = posterSchema.table('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table 1: Customer identifiers (no login required)
export const customers = posterSchema.table('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(), // Primary identifier
  email: text('email'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table 2: Ad postings (boards)
export const adPostings = posterSchema.table('ad_postings', {
  id: serial('id').primaryKey(),

  // User reference (for authenticated users)
  userId: integer('user_id').references(() => users.id),

  // Owner/Customer reference (optional - can post without being a customer)
  customerPhone: text('customer_phone'), // References customers by phone
  ownerName: text('owner_name').notNull(),
  ownerPhone: text('owner_phone').notNull(),
  ownerEmail: text('owner_email'),

  // Ad details
  title: text('title').notNull(),
  description: text('description').notNull(),

  // Location data
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),

  // Board specifications
  width: real('width').notNull(), // in meters
  height: real('height').notNull(), // in meters
  boardType: text('board_type').notNull(), // e.g., "billboard", "digital", "poster"

  // Images stored in R2
  images: text('images').array().notNull(), // array of R2 URLs
  thumbnailImage: text('thumbnail_image').notNull(),

  // Pricing
  pricePerDay: integer('price_per_day').notNull(), // in qəpik (cents)
  pricePerWeek: integer('price_per_week').notNull(),
  pricePerMonth: integer('price_per_month').notNull(),

  // Status
  isActive: boolean('is_active').default(true).notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),

  // View count for analytics
  viewCount: integer('view_count').default(0).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table 3: Statistics for tracking views and phone reveals
export const statistics = posterSchema.table('statistics', {
  id: serial('id').primaryKey(),

  // Reference to the listing
  listingId: integer('listing_id').references(() => adPostings.id).notNull(),

  // Event type: 'view' or 'phone_reveal'
  eventType: text('event_type').notNull(), // 'view' | 'phone_reveal'

  // Optional: track IP for unique views (anonymized)
  ipHash: text('ip_hash'), // hashed IP for privacy

  // Optional: user agent for analytics
  userAgent: text('user_agent'),

  // Timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type AdPosting = typeof adPostings.$inferSelect;
export type NewAdPosting = typeof adPostings.$inferInsert;
export type Statistic = typeof statistics.$inferSelect;
export type NewStatistic = typeof statistics.$inferInsert;
