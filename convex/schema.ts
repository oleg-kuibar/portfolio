import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }).index("by_email", ["email"]),

  posts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
  }).index("by_userId", ["userId"]),

  comments: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    body: v.string(),
  })
    .index("by_postId", ["postId"])
    .index("by_userId", ["userId"]),

  reactions: defineTable({
    commentId: v.id("comments"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_commentId", ["commentId"])
    .index("by_userId", ["userId"]),

  // ── Scale demo tables (PM SaaS hierarchy, 11 levels) ──────────
  orgs: defineTable({
    name: v.string(),
  }),

  teams: defineTable({
    orgId: v.id("orgs"),
    name: v.string(),
  }).index("by_orgId", ["orgId"]),

  projects: defineTable({
    teamId: v.id("teams"),
    name: v.string(),
  }).index("by_teamId", ["teamId"]),

  epics: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
  }).index("by_projectId", ["projectId"]),

  tasks: defineTable({
    epicId: v.id("epics"),
    name: v.string(),
  }).index("by_epicId", ["epicId"]),

  subtasks: defineTable({
    taskId: v.id("tasks"),
    name: v.string(),
  }).index("by_taskId", ["taskId"]),

  task_comments: defineTable({
    subtaskId: v.id("subtasks"),
    body: v.string(),
  }).index("by_subtaskId", ["subtaskId"]),

  attachments: defineTable({
    commentId: v.id("task_comments"),
    name: v.string(),
  }).index("by_commentId", ["commentId"]),

  mentions: defineTable({
    attachmentId: v.id("attachments"),
    name: v.string(),
  }).index("by_attachmentId", ["attachmentId"]),

  activity_logs: defineTable({
    mentionId: v.id("mentions"),
    action: v.string(),
  }).index("by_mentionId", ["mentionId"]),

  notifications: defineTable({
    logId: v.id("activity_logs"),
    message: v.string(),
  }).index("by_logId", ["logId"]),

  // ── Scheduled delete demo ──────────────────────────────────────
  scheduled_delete_jobs: defineTable({
    rootTable: v.string(),
    rootId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("discovering"),
      v.literal("deleting"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    plan: v.array(v.object({ table: v.string(), id: v.string() })),
    deletedSoFar: v.number(),
    totalToDelete: v.number(),
    chunkSize: v.number(),
    error: v.optional(v.string()),
  }).index("by_status", ["status"]),
});
