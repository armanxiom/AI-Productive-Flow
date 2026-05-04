import { pgTable, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const userDataTable = pgTable("user_data", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  notes: jsonb("notes").notNull().default([]),
  tasks: jsonb("tasks").notNull().default([]),
  tags: jsonb("tags").notNull().default([]),
  syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserData = typeof userDataTable.$inferSelect;
