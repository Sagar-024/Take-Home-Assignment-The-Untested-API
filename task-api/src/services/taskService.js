/**
 * @typedef {Object} Task
 * @property {string} id - Unique identifier for the task.
 * @property {string} title - The title of the task.
 * @property {string} [description] - Detailed description of the task.
 * @property {('low'|'medium'|'high')} priority - The priority level of the task.
 * @property {('pending'|'in-progress'|'completed')} status - The current status of the task.
 * @property {string} [dueDate] - The optional due date of the task in ISO format.
 * @property {string} createdAt - The creation timestamp in ISO format.
 * @property {string|null} completedAt - The completion timestamp in ISO format.
 */

let tasks = []; 

/**
 * Service to manage tasks in memory.
 */
const taskService = {
  /**
   * Creates a new task.
   * @param {Object} payload - The task payload.
   * @param {string} payload.title - The title of the task.
   * @param {string} [payload.description] - The description of the task.
   * @param {('low'|'medium'|'high')} [payload.priority='medium'] - The priority of the task.
   * @param {('pending'|'in-progress'|'completed')} [payload.status='pending'] - The status of the task.
   * @param {string} [payload.dueDate] - The optional due date of the task.
   * @returns {Task} The newly created task.
   */
  create({ title, description, priority = 'medium', status = 'pending', dueDate }) {
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      status,
      dueDate,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    tasks.push(newTask);
    return newTask;
  },

  /**
   * Retrieves a paginated list of tasks.
   * @param {number} [page=1] - The 1-indexed page number to retrieve.
   * @param {number} [limit=10] - The maximum number of tasks per page.
   * @returns {Task[]} An array of tasks for the given page.
   */
  getPaginated(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return tasks.slice(offset, offset + limit);
  },

  /**
   * Retrieves all tasks matching a specific string status.
   * Strictly matches the provided status string.
   * @param {('pending'|'in-progress'|'completed')} status - The exact status to filter by.
   * @returns {Task[]} An array of tasks matching the status.
   */
  getByStatus(status) {
    return tasks.filter((t) => t.status === status);
  },

  /**
   * Marks a task as completed.
   * Note: This method preserves the original priority and updates the status and completedAt fields.
   * @param {string} id - The unique identifier of the task.
   * @returns {Task|null} The updated task, or null if the task was not found.
   */
  completeTask(id) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      status: 'completed', 
      completedAt: new Date().toISOString(),
    };
    return tasks[index];
  },

  /**
   * Generates statistics about all tasks.
   * @returns {Object} Statistics containing total counts, status counts, and overdue counts.
   */
  getStats() {
    const counts = {};
    let overdue = 0;
    const now = new Date();

    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
      if (t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < now) {
        overdue++;
      }
    });

    return { total: tasks.length, statusCounts: counts, overdueCount: overdue };
  },

  /**
   * Clears all tasks (primarily used for test environment teardown).
   * @returns {void}
   */
  clearAll() {
    tasks = [];
  }
};

export default taskService;
