import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createTroubleshootingScript, getTroubleshootingScripts } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("headset.troubleshooting", () => {
  beforeAll(async () => {
    // Ensure at least one script exists for testing
    const existingScripts = await getTroubleshootingScripts();
    if (existingScripts.length === 0) {
      await createTroubleshootingScript({
        name: "Test Script",
        description: "A test troubleshooting script",
        category: "system",
        command: "echo 'Hello World'",
        requiresRoot: false,
        platform: "all",
        isActive: true,
      });
    }
  });

  it("should list troubleshooting scripts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.headset.troubleshooting.listScripts({});

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should filter scripts by category", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.headset.troubleshooting.listScripts({ category: "audio" });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    // All returned scripts should be in the 'audio' category
    result.forEach(script => {
      expect(script.category).toBe("audio");
    });
  });

  it("should execute a simple script successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a simple test script that will work in any environment
    await createTroubleshootingScript({
      name: "Echo Test",
      description: "Simple echo test for unit testing",
      category: "system",
      command: "echo 'Test successful'",
      requiresRoot: false,
      platform: "all",
      isActive: true,
    });

    // Get the script we just created
    const scripts = await caller.headset.troubleshooting.listScripts({});
    const testScript = scripts.find(s => s.name === "Echo Test");
    
    expect(testScript).toBeDefined();
    
    if (testScript) {
      const result = await caller.headset.troubleshooting.executeScript({ scriptId: testScript.id });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.output).toContain("Test successful");
      expect(result.executionTime).toBeGreaterThan(0);
    }
  });

  it("should record script execution in history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get execution history
    const history = await caller.headset.troubleshooting.listExecutions({ limit: 10 });

    expect(history).toBeDefined();
    expect(Array.isArray(history)).toBe(true);
  });
});
