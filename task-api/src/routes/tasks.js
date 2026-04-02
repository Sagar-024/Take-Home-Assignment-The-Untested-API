/**
 * @fileOverview Express router for task management endpoints.
 */

import express from "express";
import taskService from "../services/taskService.js";
import {
  validateCreateTask,
  validateUpdateTask,
} from "../utils/validators.js";

const router = express.Router();

/**
 * GET /stats
 * Retrieves global statistics for all tasks.
 * @returns {Object} Application statistics including total counts, counts by status, and overdue tasks.
 */
router.get("/stats", (req, res) => {
  const stats = taskService.getStats();
  res.json(stats);
});

/**
 * GET /tasks
 * Retrieves a paginated list of tasks, optionally filtered by status.
 * @param {string} [req.query.status] - Filter tasks by an exact status string (e.g., 'pending', 'in-progress', 'completed').
 * @param {number} [req.query.page=1] - The 1-indexed page number for pagination.
 * @param {number} [req.query.limit=10] - The number of tasks per page.
 * @returns {Array} A paginated array of tasks.
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
 * Creates a new task.
 * @param {Object} req.body - Configuration object for the task.
 * @returns {Object} The created task object with status 201, or error object with status 400 if validation fails.
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
 * Updates an existing task.
 * @param {string} req.params.id - The unique identifier of the task.
 * @param {Object} req.body - The updated fields for the task.
 * @returns {Object} The updated task object, or an error object if validation fails or task is not found.
 */
router.put("/:id", (req, res) => {
  const error = validateUpdateTask(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  if (typeof taskService.update !== 'function') {
    return res.status(501).json({ error: "Method missing from taskService" });
  }

  const task = taskService.update(req.params.id, req.body);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
});

/**
 * DELETE /tasks/:id
 * Deletes a task by ID.
 * @param {string} req.params.id - The unique identifier of the task.
 * @returns {void} 204 No Content on success, or 404 if not found.
 */
router.delete("/:id", (req, res) => {
  if (typeof taskService.remove !== 'function') {
    return res.status(501).json({ error: "Method missing from taskService" });
  }

  const deleted = taskService.remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.status(204).send();
});

/**
 * PATCH /tasks/:id/complete
 * Marks a task as completed and preserves its priority.
 * @param {string} req.params.id - The unique identifier of the task.
 * @returns {Object} The completed task object, or an error object with status 404 if not found.
 */
router.patch("/:id/complete", (req, res) => {
  const task = taskService.completeTask(req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
});

export default router;
