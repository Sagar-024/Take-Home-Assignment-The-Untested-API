import taskService from "../src/services/taskService.js";

beforeEach(() => {
  taskService.clearAll();
});

describe("create()", () => {
  it('defaults status to "pending"', () => {
    const task = taskService.create({ title: "Test Task" });
    expect(task.status).toBe("pending");
  });

  it("preserves an explicitly provided status", () => {
    const task = taskService.create({
      title: "In-progress task",
      status: "in-progress",
    });
    expect(task.status).toBe("in-progress");
  });
});

describe("getByStatus()", () => {
  it("does not return false substring matches", () => {
    taskService.create({ title: "Pending task", status: "pending" });
    taskService.create({ title: "Completed task", status: "completed" });
    const results = getByStatus("in");
    expect(results).toHaveLength(0);
  });

  it("returns exact status matches", () => {
    taskService.create({ title: "Task A", status: "pending" });
    taskService.create({ title: "Task B", status: "completed" });
    taskService.create({ title: "Task C", status: "in-progress" });

    const pending = taskService.getByStatus("pending");
    expect(pending).toHaveLength(1);
    expect(pending[0].title).toBe("Task A");

    const completed = taskService.getByStatus("completed");
    expect(completed).toHaveLength(1);
    expect(completed[0].title).toBe("Task B");
  });
});

describe("getStats()", () => {
  it("counts dynamic status schemas correctly", () => {
    taskService.create({ title: "A", status: "pending" });
    taskService.create({ title: "B", status: "pending" });
    taskService.create({ title: "C", status: "in-progress" });
    taskService.create({ title: "D", status: "completed" });

    const stats = taskService.getStats();

    expect(stats.statusCounts.pending).toBe(2);
    expect(stats.statusCounts["in-progress"]).toBe(1);
    expect(stats.statusCounts.completed).toBe(1);
    expect(stats.overdueCount).toBe(0);
  });

  it("counts overdue tasks", () => {
    taskService.create({
      title: "Overdue",
      status: "pending",
      dueDate: "2000-01-01T00:00:00.000Z",
    });
    taskService.create({
      title: "Future",
      status: "pending",
      dueDate: "2099-01-01T00:00:00.000Z",
    });

    const stats = taskService.getStats();
    expect(stats.overdueCount).toBe(1);
  });
});

describe("assignTask()", () => {
  it("assigns a valid string to the task", () => {
    const task = taskService.create({ title: "Test Assign" });
    const updated = taskService.assignTask(task.id, "Alice");
    expect(updated).not.toBeNull();
    expect(updated.assignee).toBe("Alice");
  });

  it("returns null if task does not exist", () => {
    const updated = taskService.assignTask("invalid-id", "Bob");
    expect(updated).toBeNull();
  });
});

function getByStatus(status) {
  return taskService.getByStatus(status);
}
