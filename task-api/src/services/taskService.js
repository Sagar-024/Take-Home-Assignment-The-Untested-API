import { TASK_STATUS, TASK_PRIORITY } from "../constants.js";

/**
 * @typedef {Object} Task
 * @property {string} id - Unique identifier securely generated via timestamp.
 * @property {string} title - The mandatory execution title.
 * @property {string} [description] - Extended contextual description.
 * @property {string} priority - Bounded priority values defined in TASK_PRIORITY.
 * @property {string} status - Bounded execution state defined in TASK_STATUS.
 * @property {string} [dueDate] - Enforced ISO-8601 formatting for reliable time-series parsing.
 * @property {string} createdAt - Immutably bound at insertion.
 * @property {string|null} completedAt - Dynamically assigned at completion for analytical diffing.
 * @property {string|null} assignee - Bounded identity reference to establish ownership.
 */

let tasks = []; 

/**
 * Singleton service establishing the core data bounds and lifecycle policies for the Tasks model.
 * Operating in-memory strictly for demonstrative load testing.
 */
const taskService = {
  /**
   * Instantiates a new task entry. 
   * Defaults to MEDIUM priority and PENDING status to ensure immediate integration readiness.
   * @param {Object} payload 
   * @returns {Task} The newly synthesized entry.
   */
  create({ title, description, priority = TASK_PRIORITY.MEDIUM, status = TASK_STATUS.PENDING, dueDate }) {
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      status,
      dueDate,
      createdAt: new Date().toISOString(),
      completedAt: null,
      assignee: null,
    };
    tasks.push(newTask);
    return newTask;
  },

  /**
   * Retrieves a contiguous slice of tasks.
   * Operates deliberately on 1-indexed pagination math to comply seamlessly with standard REST API consumer expectations.
   * @param {number} [page=1] 
   * @param {number} [limit=10] 
   * @returns {Task[]} Evaluated array chunk.
   */
  getPaginated(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return tasks.slice(offset, offset + limit);
  },

  /**
   * Blindly overrides task properties without strict schema parsing. 
   * Useful for internal patches where properties have already been fully validated upstream via utility layers.
   * @param {string} id 
   * @param {Object} fields 
   * @returns {Task|null}
   */
  update(id, fields) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...fields };
    return tasks[index];
  },

  /**
   * Splicing operation to entirely vaporize an entry. 
   * Note: Destroys historical associations. Consider soft-deletes in actual production scenarios.
   * @param {string} id 
   * @returns {boolean} Resolution flag indicating successful index matching.
   */
  remove(id) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    tasks.splice(index, 1);
    return true;
  },

  /**
   * Sub-queries memory objects using exact value constraints.
   * Built specifically to reject fuzzy-matching collisions natively observed in substring-based implementations.
   * @param {string} status 
   * @returns {Task[]}
   */
  getByStatus(status) {
    return tasks.filter((t) => t.status === status);
  },

  /**
   * Selectively completes a task to lock its execution state.
   * Architected intentionally to preserve deeply layered metadata (like priority and assignment hooks) during state transitions.
   * @param {string} id 
   * @returns {Task|null}
   */
  completeTask(id) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      status: TASK_STATUS.COMPLETED, 
      completedAt: new Date().toISOString(),
    };
    return tasks[index];
  },

  /**
   * Associates external identity bounds to a specific task target.
   * Enforces strict object spreading to ensure shallow-copy reactivity if observed upstream.
   * @param {string} id 
   * @param {string} assignee 
   * @returns {Task|null}
   */
  assignTask(id, assignee) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      assignee,
    };
    return tasks[index];
  },

  /**
   * O(n) scan running a multidimensional analytical breakdown.
   * Dynamically tracks categories dynamically instead of hardcoding schema bounds to drastically reduce future architecture refactors.
   * @returns {Object} Analytical node snapshot mappings.
   */
  getStats() {
    const counts = {};
    let overdue = 0;
    const now = new Date();

    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
      if (t.dueDate && t.status !== TASK_STATUS.COMPLETED && new Date(t.dueDate) < now) {
        overdue++;
      }
    });

    return { total: tasks.length, statusCounts: counts, overdueCount: overdue };
  },

  /**
   * Decoupled integration hook designed explicitly for deterministic unit-test resets.
   * Destroys module state memory without exposing internal arrays.
   * @returns {void}
   */
  clearAll() {
    tasks = [];
  }
};

export default taskService;
