/**
 * @fileOverview Express router for task management endpoints.
 */

import express from "express";
import taskService from "../services/taskService.js";
import {
  validateCreateTask,
  validateUpdateTask,
  validateAssignTask,
} from "../utils/validators.js";

const router = express.Router();

if (process.env.NODE_ENV === "test") {
  router.post("/test/clear", (req, res) => {
    taskService.clearAll();
    res.status(204).send();
  });
}

/**
 * GET /stats
 * Exposes real-time analytical aggregations for the frontend dashboard.
 * Evaluates live objects dynamically instead of relying on cached counters to guarantee accuracy.
 */
router.get("/stats", (req, res) => {
  const stats = taskService.getStats();
  res.json(stats);
});

/**
 * GET /tasks
 * Master collection endpoint supporting query-params for strict subset filtering.
 * Applies zero-indexed server-side math mapped dynamically to 1-indexed client queries.
 */
router.get("/", (req, res) => {
  const { status, page, limit } = req.query;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  if (status) {
    let tasks = taskService.getByStatus(status);
    const offset = (pageNum - 1) * limitNum;
    tasks = tasks.slice(offset, offset + limitNum);
    return res.json(tasks);
  }

  const tasks = taskService.getPaginated(pageNum, limitNum);
  res.json(tasks);
});

/**
 * POST /tasks
 * Ingress point for new task allocations. Bounds properties against strict business rules.
 */
router.post("/", (req, res) => {
  const error = validateCreateTask(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const task = taskService.create(req.body);
  res.status(201).json(task);
});

/**
 * PUT /tasks/:id
 * Blindly overrides arbitrary payload values. Restricted exclusively to fully-validated properties spanning the base schema.
 */
router.put("/:id", (req, res) => {
  const error = validateUpdateTask(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  if (typeof taskService.update !== 'function') {
    return res.status(501).json({ error: "Service configuration error: update() intercept missing on provider." });
  }

  const task = taskService.update(req.params.id, req.body);
  if (!task) {
    return res.status(404).json({ error: "Task update failed. No task found matching the provided identifier." });
  }
  res.json(task);
});

/**
 * DELETE /tasks/:id
 * Hard-deletes target elements from underlying storage. Breaks historical reference limits.
 */
router.delete("/:id", (req, res) => {
  if (typeof taskService.remove !== 'function') {
    return res.status(501).json({ error: "Service configuration error: remove() intercept missing on provider." });
  }

  const deleted = taskService.remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Task deletion failed. No task found matching the provided identifier." });
  }
  res.status(204).send();
});

/**
 * PATCH /tasks/:id/complete
 * Dedicated lifecycle closure method. Guarantees safety of historical metadata hooks when flagging closure states.
 */
router.patch("/:id/complete", (req, res) => {
  const task = taskService.completeTask(req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Completion failed. No task found matching the provided identifier." });
  }
  res.json(task);
});

/**
 * PATCH /tasks/:id/assign
 * Unidirectional assignment hook binding specific external identities strictly onto the internal timeline.
 */
router.patch("/:id/assign", (req, res) => {
  const error = validateAssignTask(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const task = taskService.assignTask(req.params.id, req.body.assignee);
  if (!task) {
    return res.status(404).json({ error: "Assignment failed. No task found matching the provided identifier." });
  }
  res.json(task);
});

export default router;
