import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Audio devices detected by the system
 */
export const audioDevices = mysqlTable("audio_devices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Owner of the device record
  deviceId: varchar("deviceId", { length: 255 }).notNull(), // Browser MediaDevices ID
  label: text("label"),
  kind: varchar("kind", { length: 50 }).notNull(), // 'audioinput' | 'audiooutput'
  groupId: varchar("groupId", { length: 255 }),
  manufacturer: varchar("manufacturer", { length: 255 }),
  driver: varchar("driver", { length: 255 }),
  isUsb: boolean("isUsb").default(false),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AudioDevice = typeof audioDevices.$inferSelect;
export type InsertAudioDevice = typeof audioDevices.$inferInsert;

/**
 * Audio test records (recordings, noise tests, etc.)
 */
export const audioTests = mysqlTable("audio_tests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deviceId: int("deviceId"), // Reference to audioDevices.id
  deviceLabel: varchar("deviceLabel", { length: 255 }), // Device name for reference
  testType: mysqlEnum("testType", ["recording", "noise_cancellation", "spectrum_analysis"]).notNull(),
  duration: int("duration"), // Duration in seconds
  spectrumData: json("spectrumData"), // JSON array of frequency data
  noiseLevel: int("noiseLevel"), // Average noise level (0-255)
  peakFrequency: int("peakFrequency"), // Peak frequency detected (Hz)
  quality: mysqlEnum("quality", ["excellent", "good", "fair", "poor"]),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AudioTest = typeof audioTests.$inferSelect;
export type InsertAudioTest = typeof audioTests.$inferInsert;

/**
 * System logs and diagnostic messages
 */
export const systemLogs = mysqlTable("system_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  level: mysqlEnum("level", ["info", "warning", "error", "debug"]).notNull(),
  source: varchar("source", { length: 100 }).notNull(), // 'frontend' | 'backend' | 'driver' | 'system'
  message: text("message").notNull(),
  details: json("details"), // Additional structured data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = typeof systemLogs.$inferInsert;

/**
 * Troubleshooting scripts and their execution history
 */
export const troubleshootingScripts = mysqlTable("troubleshooting_scripts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["driver", "audio", "system", "network"]).notNull(),
  command: text("command").notNull(), // Shell command to execute
  requiresRoot: boolean("requiresRoot").default(false),
  platform: mysqlEnum("platform", ["linux", "windows", "all"]).default("all").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TroubleshootingScript = typeof troubleshootingScripts.$inferSelect;
export type InsertTroubleshootingScript = typeof troubleshootingScripts.$inferInsert;

/**
 * Execution history of troubleshooting scripts
 */
export const scriptExecutions = mysqlTable("script_executions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scriptId: int("scriptId").notNull(), // Reference to troubleshootingScripts.id
  status: mysqlEnum("status", ["pending", "running", "success", "failed"]).notNull(),
  output: text("output"), // Command output
  errorMessage: text("errorMessage"),
  executionTime: int("executionTime"), // Duration in milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ScriptExecution = typeof scriptExecutions.$inferSelect;
export type InsertScriptExecution = typeof scriptExecutions.$inferInsert;

/**
 * AI diagnostic sessions
 */
export const aiDiagnostics = mysqlTable("ai_diagnostics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  prompt: text("prompt").notNull(), // User's question or log data sent to AI
  response: text("response"), // AI's diagnostic response
  provider: varchar("provider", { length: 50 }), // 'openai' | 'anthropic' | 'gemini'
  model: varchar("model", { length: 100 }),
  tokensUsed: int("tokensUsed"),
  wasHelpful: boolean("wasHelpful"), // User feedback
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIDiagnostic = typeof aiDiagnostics.$inferSelect;
export type InsertAIDiagnostic = typeof aiDiagnostics.$inferInsert;