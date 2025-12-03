import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../../package.json"), "utf-8")
);

const CURRENT_VERSION = packageJson.version;
const GITHUB_REPO = "B0yZ4kr14/HeadsetManager";

/**
 * Compare two semantic versions
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  /**
   * Get current application version
   */
  getVersion: publicProcedure.query(() => {
    return {
      version: CURRENT_VERSION,
      releaseDate: new Date().toISOString(),
    };
  }),

  /**
   * Check for updates from GitHub releases
   */
  checkForUpdates: publicProcedure.query(async () => {
    try {
      // Fetch latest release from GitHub API
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
        {
          headers: {
            "User-Agent": "HeadsetManager",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }

      const latestRelease = await response.json();
      const latestVersion = latestRelease.tag_name.replace(/^v/, "");

      const isUpdateAvailable = compareVersions(latestVersion, CURRENT_VERSION) > 0;

      return {
        currentVersion: CURRENT_VERSION,
        latestVersion,
        isUpdateAvailable,
        releaseUrl: latestRelease.html_url,
        releaseNotes: latestRelease.body,
        publishedAt: latestRelease.published_at,
        assets: latestRelease.assets.map((asset: any) => ({
          name: asset.name,
          downloadUrl: asset.browser_download_url,
          size: asset.size,
        })),
      };
    } catch (error) {
      console.error("Failed to check for updates:", error);
      return {
        currentVersion: CURRENT_VERSION,
        latestVersion: CURRENT_VERSION,
        isUpdateAvailable: false,
        error: "Failed to check for updates",
      };
    }
  }),
});
