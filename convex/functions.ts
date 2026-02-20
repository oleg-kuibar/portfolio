import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { CascadingDeletes } from "@convex-dev/cascading-deletes";
import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";
import { components, internal } from "./_generated/api";

// ── Rate limiter (official Convex component) ────────────────────────────
const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Global safety net across all visitors
  demoGlobal: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 5 },
  // Per-session bucket (keyed by anonymous session ID)
  demoSession: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 3 },
});

// ── Cascade config ──────────────────────────────────────────────────────
const cascade = new CascadingDeletes(components.cascadingDeletes, {
  relationships: [
    // Playground tables (users/posts/comments/reactions)
    {
      name: "user_posts",
      sourceTable: "users",
      targetTable: "posts",
      targetIndex: "by_userId",
      targetIndexFields: ["userId"],
    },
    {
      name: "user_comments",
      sourceTable: "users",
      targetTable: "comments",
      targetIndex: "by_userId",
      targetIndexFields: ["userId"],
    },
    {
      name: "user_reactions",
      sourceTable: "users",
      targetTable: "reactions",
      targetIndex: "by_userId",
      targetIndexFields: ["userId"],
    },
    {
      name: "post_comments",
      sourceTable: "posts",
      targetTable: "comments",
      targetIndex: "by_postId",
      targetIndexFields: ["postId"],
    },
    {
      name: "comment_reactions",
      sourceTable: "comments",
      targetTable: "reactions",
      targetIndex: "by_commentId",
      targetIndexFields: ["commentId"],
    },
    // Scale tables (PM SaaS hierarchy, 11 levels)
    {
      name: "org_teams",
      sourceTable: "orgs",
      targetTable: "teams",
      targetIndex: "by_orgId",
      targetIndexFields: ["orgId"],
    },
    {
      name: "team_projects",
      sourceTable: "teams",
      targetTable: "projects",
      targetIndex: "by_teamId",
      targetIndexFields: ["teamId"],
    },
    {
      name: "project_epics",
      sourceTable: "projects",
      targetTable: "epics",
      targetIndex: "by_projectId",
      targetIndexFields: ["projectId"],
    },
    {
      name: "epic_tasks",
      sourceTable: "epics",
      targetTable: "tasks",
      targetIndex: "by_epicId",
      targetIndexFields: ["epicId"],
    },
    {
      name: "task_subtasks",
      sourceTable: "tasks",
      targetTable: "subtasks",
      targetIndex: "by_taskId",
      targetIndexFields: ["taskId"],
    },
    {
      name: "subtask_comments",
      sourceTable: "subtasks",
      targetTable: "task_comments",
      targetIndex: "by_subtaskId",
      targetIndexFields: ["subtaskId"],
    },
    {
      name: "comment_attachments",
      sourceTable: "task_comments",
      targetTable: "attachments",
      targetIndex: "by_commentId",
      targetIndexFields: ["commentId"],
    },
    {
      name: "attachment_mentions",
      sourceTable: "attachments",
      targetTable: "mentions",
      targetIndex: "by_attachmentId",
      targetIndexFields: ["attachmentId"],
    },
    {
      name: "mention_activity",
      sourceTable: "mentions",
      targetTable: "activity_logs",
      targetIndex: "by_mentionId",
      targetIndexFields: ["mentionId"],
    },
    {
      name: "activity_notifications",
      sourceTable: "activity_logs",
      targetTable: "notifications",
      targetIndex: "by_logId",
      targetIndexFields: ["logId"],
    },
  ],
});

// ── Seed (idempotent, capped, rate-limited) ─────────────────────────────
export const seed = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    await rateLimiter.limit(ctx, "demoGlobal", { throws: true });
    await rateLimiter.limit(ctx, "demoSession", { key: sessionId, throws: true });

    // Refuse if data already exists
    const existingUsers = await ctx.db.query("users").first();
    if (existingUsers) {
      throw new Error("Data already exists. Clear first before re-seeding.");
    }

    const alice = await ctx.db.insert("users", {
      name: "Alice",
      email: "alice@example.com",
    });
    const bob = await ctx.db.insert("users", {
      name: "Bob",
      email: "bob@example.com",
    });

    const post1 = await ctx.db.insert("posts", {
      userId: alice,
      title: "Hello World",
      body: "My first post!",
    });
    const post2 = await ctx.db.insert("posts", {
      userId: alice,
      title: "Cascade Deletes",
      body: "A deep dive into cascading deletes.",
    });
    const post3 = await ctx.db.insert("posts", {
      userId: bob,
      title: "Bob's Post",
      body: "Hello from Bob!",
    });

    const comment1 = await ctx.db.insert("comments", {
      postId: post1,
      userId: bob,
      body: "Great post, Alice!",
    });
    const comment2 = await ctx.db.insert("comments", {
      postId: post1,
      userId: alice,
      body: "Thanks Bob!",
    });
    const comment3 = await ctx.db.insert("comments", {
      postId: post2,
      userId: bob,
      body: "Very informative.",
    });
    const comment4 = await ctx.db.insert("comments", {
      postId: post3,
      userId: alice,
      body: "Nice one, Bob!",
    });

    await ctx.db.insert("reactions", {
      commentId: comment1,
      userId: alice,
      emoji: "👍",
    });
    await ctx.db.insert("reactions", {
      commentId: comment2,
      userId: bob,
      emoji: "❤️",
    });
    await ctx.db.insert("reactions", {
      commentId: comment3,
      userId: alice,
      emoji: "🎉",
    });
    await ctx.db.insert("reactions", {
      commentId: comment4,
      userId: bob,
      emoji: "👍",
    });

    return { users: [alice, bob], posts: [post1, post2, post3] };
  },
});

// ── Clear all (rate-limited) ────────────────────────────────────────────
export const clearAll = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    await rateLimiter.limit(ctx, "demoGlobal", { throws: true });
    await rateLimiter.limit(ctx, "demoSession", { key: sessionId, throws: true });

    for (const table of ["reactions", "comments", "posts", "users"] as const) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
  },
});

// ── Cascade delete (rate-limited) ───────────────────────────────────────
export const deleteWithCascade = mutation({
  args: { table: v.string(), id: v.string(), sessionId: v.string() },
  handler: async (ctx, { table, id, sessionId }) => {
    await rateLimiter.limit(ctx, "demoGlobal", { throws: true });
    await rateLimiter.limit(ctx, "demoSession", { key: sessionId, throws: true });
    return await cascade.deleteWithCascade(ctx as any, table, id as any);
  },
});

// ── Dry-run preview (rate-limited) ──────────────────────────────────────
export const previewCascade = mutation({
  args: { table: v.string(), id: v.string(), sessionId: v.string() },
  handler: async (ctx, { table, id, sessionId }) => {
    await rateLimiter.limit(ctx, "demoGlobal", { throws: true });
    await rateLimiter.limit(ctx, "demoSession", { key: sessionId, throws: true });
    return await cascade.deleteWithCascade(ctx as any, table, id as any, {
      dryRun: true,
    });
  },
});

// ── List all (query, no rate limit needed) ───────────────────────────────
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const [users, posts, comments, reactions] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("posts").collect(),
      ctx.db.query("comments").collect(),
      ctx.db.query("reactions").collect(),
    ]);
    return { users, posts, comments, reactions };
  },
});

// ── Scale demo: seed (idempotent, rate-limited) ──────────────────────────

// Deterministic branching pattern — same tree every seed
const BRANCH = [2, 1, 3, 0, 2, 1, 2, 0, 1, 3, 1, 2, 0, 2, 1, 1, 3, 0, 2, 1];
function childCount(idx: number, max: number, offset = 0): number {
  return BRANCH[(idx + offset) % BRANCH.length] % (max + 1);
}

export const seedScale = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    await rateLimiter.limit(ctx, "demoGlobal", { throws: true });
    await rateLimiter.limit(ctx, "demoSession", { key: sessionId, throws: true });

    const existing = await ctx.db.query("orgs").first();
    if (existing) {
      throw new Error("Scale data already exists. Clear first before re-seeding.");
    }

    // Level 0: 1 org
    const org = await ctx.db.insert("orgs", { name: "Acme Corp" });

    // Level 1: 4 teams
    const teamNames = ["Engineering", "Design", "Marketing", "Product"];
    const teams: string[] = [];
    for (const name of teamNames) {
      teams.push(await ctx.db.insert("teams", { orgId: org, name }));
    }

    // Level 2: 12 projects (3 per team)
    const projectDefs: [number, string[]][] = [
      [0, ["Platform", "Mobile", "Analytics"]],
      [1, ["Design Sys", "UX Research", "Brand"]],
      [2, ["Q1 Campaign", "SEO", "Content"]],
      [3, ["Roadmap", "Metrics", "Strategy"]],
    ];
    const projects: string[] = [];
    for (const [teamIdx, names] of projectDefs) {
      for (const name of names) {
        projects.push(await ctx.db.insert("projects", { teamId: teams[teamIdx] as any, name }));
      }
    }

    // Level 3: ~18 epics (1-3 per project, deterministic)
    const epicNames = [
      "Auth", "API", "Dashboard", "Search", "Onboard", "Notifs",
      "Reports", "Export", "Components", "Interviews", "Ads",
      "Rankings", "Tokens", "Billing", "Audit", "i18n",
      "Perf", "Cache",
    ];
    const epics: string[] = [];
    let epicNameIdx = 0;
    for (let p = 0; p < projects.length; p++) {
      const count = 1 + childCount(p, 2, 0); // 1-3 epics per project
      for (let i = 0; i < count; i++) {
        const name = epicNames[epicNameIdx % epicNames.length];
        epicNameIdx++;
        epics.push(await ctx.db.insert("epics", { projectId: projects[p] as any, name }));
      }
    }

    // Level 4: tasks — 0-3 per epic (some epics are leaf nodes!)
    const tasksList: string[] = [];
    for (let e = 0; e < epics.length; e++) {
      const count = childCount(e, 3, 2);
      for (let t = 0; t < count; t++) {
        tasksList.push(
          await ctx.db.insert("tasks", { epicId: epics[e] as any, name: `T${tasksList.length + 1}` })
        );
      }
    }

    // Level 5: subtasks — 0-2 per task
    const subtasksList: string[] = [];
    for (let t = 0; t < tasksList.length; t++) {
      const count = childCount(t, 2, 5);
      for (let s = 0; s < count; s++) {
        subtasksList.push(
          await ctx.db.insert("subtasks", { taskId: tasksList[t] as any, name: `ST${subtasksList.length + 1}` })
        );
      }
    }

    // Level 6: task_comments — 0-3 per subtask
    const commentsList: string[] = [];
    for (let s = 0; s < subtasksList.length; s++) {
      const count = childCount(s, 3, 7);
      for (let c = 0; c < count; c++) {
        commentsList.push(
          await ctx.db.insert("task_comments", { subtaskId: subtasksList[s] as any, body: `C${commentsList.length + 1}` })
        );
      }
    }

    // Level 7: attachments — 0-2 per comment
    const attachmentsList: string[] = [];
    for (let c = 0; c < commentsList.length; c++) {
      const count = childCount(c, 2, 11);
      for (let a = 0; a < count; a++) {
        attachmentsList.push(
          await ctx.db.insert("attachments", { commentId: commentsList[c] as any, name: `A${attachmentsList.length + 1}` })
        );
      }
    }

    // Level 8: mentions — 0-2 per attachment
    const mentionsList: string[] = [];
    for (let a = 0; a < attachmentsList.length; a++) {
      const count = childCount(a, 2, 13);
      for (let m = 0; m < count; m++) {
        mentionsList.push(
          await ctx.db.insert("mentions", { attachmentId: attachmentsList[a] as any, name: "@user" })
        );
      }
    }

    // Level 9: activity_logs — 0-2 per mention
    const logsList: string[] = [];
    for (let m = 0; m < mentionsList.length; m++) {
      const count = childCount(m, 2, 17);
      for (let l = 0; l < count; l++) {
        logsList.push(
          await ctx.db.insert("activity_logs", { mentionId: mentionsList[m] as any, action: "log" })
        );
      }
    }

    // Level 10: notifications — 0-2 per log
    for (let l = 0; l < logsList.length; l++) {
      const count = childCount(l, 2, 19);
      for (let n = 0; n < count; n++) {
        await ctx.db.insert("notifications", { logId: logsList[l] as any, message: "notif" });
      }
    }
  },
});

// ── Scale demo: clear all (rate-limited) ─────────────────────────────────
export const clearScale = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    await rateLimiter.limit(ctx, "demoGlobal", { throws: true });
    await rateLimiter.limit(ctx, "demoSession", { key: sessionId, throws: true });

    // Delete leaf-first
    const tables = [
      "notifications", "activity_logs", "mentions", "attachments",
      "task_comments", "subtasks", "tasks", "epics", "projects", "teams", "orgs",
    ] as const;

    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
  },
});

// ── Scale demo: list all (query) ─────────────────────────────────────────
export const listAllScale = query({
  args: {},
  handler: async (ctx) => {
    const [
      orgs, teams, projects, epics, tasks, subtasks,
      task_comments, attachments, mentions, activity_logs, notifications,
    ] = await Promise.all([
      ctx.db.query("orgs").collect(),
      ctx.db.query("teams").collect(),
      ctx.db.query("projects").collect(),
      ctx.db.query("epics").collect(),
      ctx.db.query("tasks").collect(),
      ctx.db.query("subtasks").collect(),
      ctx.db.query("task_comments").collect(),
      ctx.db.query("attachments").collect(),
      ctx.db.query("mentions").collect(),
      ctx.db.query("activity_logs").collect(),
      ctx.db.query("notifications").collect(),
    ]);
    return {
      orgs, teams, projects, epics, tasks, subtasks,
      task_comments, attachments, mentions, activity_logs, notifications,
    };
  },
});

// ── Scheduled delete demo ────────────────────────────────────────────────

export const startScheduledDelete = mutation({
  args: {
    table: v.string(),
    id: v.string(),
    chunkSize: v.optional(v.number()),
    sessionId: v.string(),
  },
  handler: async (ctx, { table, id, chunkSize: chunkSizeArg, sessionId }) => {
    await rateLimiter.limit(ctx, "demoGlobal", { throws: true });
    await rateLimiter.limit(ctx, "demoSession", { key: sessionId, throws: true });

    const chunkSize = chunkSizeArg ?? 3;

    // Dry-run to discover the full deletion plan
    const result = await cascade.deleteWithCascade(ctx as any, table, id as any, {
      dryRun: true,
    });
    const plan = (result as any).plan as Array<{ table: string; documentId: string }>;

    // Convert plan entries to { table, id } format
    const planEntries = plan.map((entry) => ({
      table: entry.table,
      id: entry.documentId,
    }));

    const jobId = await ctx.db.insert("scheduled_delete_jobs", {
      rootTable: table,
      rootId: id,
      status: "deleting",
      plan: planEntries,
      deletedSoFar: 0,
      totalToDelete: planEntries.length,
      chunkSize,
    });

    await ctx.scheduler.runAfter(0, internal.functions.processDeleteChunk, {
      jobId,
    });

    return jobId;
  },
});

export const processDeleteChunk = internalMutation({
  args: { jobId: v.id("scheduled_delete_jobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.db.get(jobId);
    if (!job || job.status !== "deleting") return;

    const { plan, deletedSoFar, chunkSize } = job;
    const chunk = plan.slice(deletedSoFar, deletedSoFar + chunkSize);

    let deleted = 0;
    try {
      for (const entry of chunk) {
        try {
          const doc = await ctx.db.get(entry.id as any);
          if (doc) {
            await ctx.db.delete(entry.id as any);
            deleted++;
          }
        } catch {
          // Doc already gone or invalid — skip (retry-safe)
        }
      }

      const newTotal = deletedSoFar + deleted;
      const remaining = plan.length - (deletedSoFar + chunk.length);

      if (remaining <= 0) {
        await ctx.db.patch(jobId, {
          deletedSoFar: newTotal,
          status: "completed",
        });
      } else {
        await ctx.db.patch(jobId, { deletedSoFar: newTotal });
        await ctx.scheduler.runAfter(
          500,
          internal.functions.processDeleteChunk,
          { jobId }
        );
      }
    } catch (e: any) {
      await ctx.db.patch(jobId, {
        status: "failed",
        error: e?.message || "Unknown error",
      });
    }
  },
});

export const cancelScheduledDelete = mutation({
  args: { jobId: v.id("scheduled_delete_jobs"), sessionId: v.string() },
  handler: async (ctx, { jobId, sessionId }) => {
    await rateLimiter.limit(ctx, "demoGlobal", { throws: true });
    await rateLimiter.limit(ctx, "demoSession", { key: sessionId, throws: true });
    const job = await ctx.db.get(jobId);
    if (job && job.status === "deleting") {
      await ctx.db.patch(jobId, { status: "cancelled" });
    }
  },
});

export const listScheduledJobs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("scheduled_delete_jobs")
      .order("desc")
      .collect();
  },
});

export const clearScheduledJobs = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    await rateLimiter.limit(ctx, "demoGlobal", { throws: true });
    await rateLimiter.limit(ctx, "demoSession", { key: sessionId, throws: true });
    const jobs = await ctx.db.query("scheduled_delete_jobs").collect();
    for (const job of jobs) {
      await ctx.db.delete(job._id);
    }
  },
});
