import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  audioDevices,
  audioTests,
  systemLogs,
  troubleshootingScripts,
  scriptExecutions,
  aiDiagnostics,
  InsertAudioDevice,
  InsertAudioTest,
  InsertSystemLog,
  InsertTroubleshootingScript,
  InsertScriptExecution,
  InsertAIDiagnostic,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Audio Devices
export async function upsertAudioDevice(device: InsertAudioDevice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(audioDevices)
    .values(device)
    .onDuplicateKeyUpdate({
      set: {
        label: device.label,
        lastSeen: new Date(),
      },
    });
}

export async function getAudioDevicesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(audioDevices)
    .where(eq(audioDevices.userId, userId))
    .orderBy(desc(audioDevices.lastSeen));
}

// Audio Tests
export async function createAudioTest(test: InsertAudioTest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(audioTests).values(test);
  return result;
}

export async function getAudioTestsByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(audioTests)
    .where(eq(audioTests.userId, userId))
    .orderBy(desc(audioTests.createdAt))
    .limit(limit);
}

// System Logs
export async function createSystemLog(log: InsertSystemLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(systemLogs).values(log);
}

export async function getSystemLogsByUserId(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(systemLogs)
    .where(eq(systemLogs.userId, userId))
    .orderBy(desc(systemLogs.createdAt))
    .limit(limit);
}

export async function getAllSystemLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(systemLogs)
    .orderBy(desc(systemLogs.createdAt))
    .limit(limit);
}

// Troubleshooting Scripts
export async function getTroubleshootingScripts(category?: string) {
  const db = await getDb();
  if (!db) return [];

  if (category) {
    return await db
      .select()
      .from(troubleshootingScripts)
      .where(
        and(
          eq(troubleshootingScripts.isActive, true),
          eq(troubleshootingScripts.category, category as any)
        )
      )
      .orderBy(troubleshootingScripts.name);
  }

  return await db
    .select()
    .from(troubleshootingScripts)
    .where(eq(troubleshootingScripts.isActive, true))
    .orderBy(troubleshootingScripts.name);
}

export async function createTroubleshootingScript(
  script: InsertTroubleshootingScript
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(troubleshootingScripts).values(script);
  return result;
}

// Script Executions
export async function createScriptExecution(execution: InsertScriptExecution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scriptExecutions).values(execution);
  return result;
}

export async function updateScriptExecution(
  id: number,
  updates: Partial<InsertScriptExecution>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(scriptExecutions)
    .set(updates)
    .where(eq(scriptExecutions.id, id));
}

export async function getScriptExecutionsByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(scriptExecutions)
    .where(eq(scriptExecutions.userId, userId))
    .orderBy(desc(scriptExecutions.createdAt))
    .limit(limit);
}

// AI Diagnostics
export async function createAIDiagnostic(diagnostic: InsertAIDiagnostic) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(aiDiagnostics).values(diagnostic);
  return result;
}

export async function getAIDiagnosticsByUserId(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(aiDiagnostics)
    .where(eq(aiDiagnostics.userId, userId))
    .orderBy(desc(aiDiagnostics.createdAt))
    .limit(limit);
}

export async function updateAIDiagnosticFeedback(
  id: number,
  wasHelpful: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(aiDiagnostics)
    .set({ wasHelpful })
    .where(eq(aiDiagnostics.id, id));
}
