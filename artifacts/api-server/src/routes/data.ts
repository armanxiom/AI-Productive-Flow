import { Router, type Request, type Response } from "express";
import { db, userDataTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/data/sync", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [row] = await db
    .select()
    .from(userDataTable)
    .where(eq(userDataTable.userId, req.user.id));

  if (!row) {
    res.json({ notes: [], tasks: [], tags: [], syncedAt: null });
    return;
  }

  res.json({
    notes: row.notes ?? [],
    tasks: row.tasks ?? [],
    tags: row.tags ?? [],
    syncedAt: row.syncedAt.toISOString(),
  });
});

router.post("/data/sync", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { notes, tasks, tags } = req.body as {
    notes: unknown[];
    tasks: unknown[];
    tags: unknown[];
  };

  const now = new Date();

  const [row] = await db
    .insert(userDataTable)
    .values({
      userId: req.user.id,
      notes: notes as Record<string, unknown>[],
      tasks: tasks as Record<string, unknown>[],
      tags: tags as Record<string, unknown>[],
      syncedAt: now,
    })
    .onConflictDoUpdate({
      target: userDataTable.userId,
      set: {
        notes: notes as Record<string, unknown>[],
        tasks: tasks as Record<string, unknown>[],
        tags: tags as Record<string, unknown>[],
        syncedAt: now,
      },
    })
    .returning();

  res.json({
    notes: row.notes ?? [],
    tasks: row.tasks ?? [],
    tags: row.tags ?? [],
    syncedAt: row.syncedAt.toISOString(),
  });
});

export default router;
