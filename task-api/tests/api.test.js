import request from "supertest";
import app, { __test_taskService as taskService } from "../src/app.js";

beforeEach(() => {
  taskService.clearAll();
});

const createTask = (overrides = {}) =>
  request(app)
    .post("/tasks")
    .send({ title: "Default Task", ...overrides });

describe("POST /tasks", () => {
  it("creates a task and returns 201 with the full task object", async () => {
    const res = await createTask({ title: "Buy milk", priority: "high" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: "Buy milk",
      priority: "high",
      status: "pending",
      completedAt: null,
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
  });

  it("returns 400 when title is missing", async () => {
    const res = await request(app).post("/tasks").send({ priority: "low" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it("returns 400 when title is an empty string", async () => {
    const res = await createTask({ title: "   " });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid status value", async () => {
    const res = await createTask({ status: "invalid_status" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/status/i);
  });

  it("returns 400 for an invalid priority value", async () => {
    const res = await createTask({ priority: "ultra" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a malformed dueDate", async () => {
    const res = await createTask({ dueDate: "not-a-date" });
    expect(res.status).toBe(400);
  });
});

describe("GET /tasks", () => {
  it("returns an empty array when no tasks exist", async () => {
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all tasks", async () => {
    await createTask({ title: "Task A" });
    await createTask({ title: "Task B" });
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("GET /tasks?status=", () => {
  it("returns only tasks matching the given status", async () => {
    await createTask({ title: "Pending 1", status: "pending" });
    await createTask({ title: "Completed 1", status: "completed" });
    const res = await request(app).get("/tasks?status=pending");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Pending 1");
  });

  it("returns an empty array when no tasks match the status", async () => {
    await createTask({ title: "Task A", status: "pending" });
    const res = await request(app).get("/tasks?status=completed");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("GET /tasks — pagination", () => {
  beforeEach(async () => {
    for (let i = 1; i <= 15; i++) {
      await createTask({ title: `Task ${i}` });
    }
  });

  it("page=1 returns the FIRST set of items", async () => {
    const res = await request(app).get("/tasks?page=1&limit=10");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
    expect(res.body[0].title).toBe("Task 1");
  });

  it("page=2 returns the remaining items", async () => {
    const res = await request(app).get("/tasks?page=2&limit=10");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
    expect(res.body[0].title).toBe("Task 11");
  });
});

describe("GET /tasks — combined status + pagination", () => {
  it("correctly filters by status and applies pagination", async () => {
    for (let i = 1; i <= 15; i++) {
      await createTask({ title: `Pending ${i}`, status: "pending" });
    }
    await createTask({ title: `Completed 1`, status: "completed" });

    const res = await request(app).get("/tasks?status=pending&page=1&limit=5");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
    expect(res.body[0].title).toBe("Pending 1");
  });
});

describe("PUT /tasks/:id", () => {
  it("updates a task and returns the updated object", async () => {
    const created = (await createTask({ title: "Original" })).body;
    const res = await request(app)
      .put(`/tasks/${created.id}`)
      .send({ title: "Updated", priority: "high" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
    expect(res.body.priority).toBe("high");
  });

  it("returns 404 for a non-existent task id", async () => {
    const res = await request(app)
      .put("/tasks/non-existent-id")
      .send({ title: "Ghost" });
    expect(res.status).toBe(404);
  });

  it("returns 400 when title is updated to an empty string", async () => {
    const created = (await createTask({ title: "Original" })).body;
    const res = await request(app)
      .put(`/tasks/${created.id}`)
      .send({ title: "" });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /tasks/:id", () => {
  it("returns 204 on successful deletion", async () => {
    const created = (await createTask({ title: "To Delete" })).body;
    const res = await request(app).delete(`/tasks/${created.id}`);
    expect(res.status).toBe(204);
  });

  it("returns 404 when deleting a non-existent task", async () => {
    const res = await request(app).delete("/tasks/ghost-id");
    expect(res.status).toBe(404);
  });
});

describe("PATCH /tasks/:id/complete", () => {
  it("marks a task as done and sets completedAt", async () => {
    const created = (await createTask({ title: "Finish me", priority: "high" })).body;
    const res = await request(app).patch(`/tasks/${created.id}/complete`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("completed");
    expect(res.body.completedAt).not.toBeNull();
  });

  it("preserves the original priority after completion", async () => {
    const created = (
      await createTask({ title: "High priority task", priority: "high" })
    ).body;
    const res = await request(app).patch(`/tasks/${created.id}/complete`);
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe("high");
  });

  it("returns 404 for a non-existent task", async () => {
    const res = await request(app).patch("/tasks/ghost-id/complete");
    expect(res.status).toBe(404);
  });
});

describe("GET /tasks/stats", () => {
  it("returns correct counts for each status", async () => {
    await createTask({ status: "pending" });
    await createTask({ status: "pending" });
    await createTask({ status: "in-progress" });
    const created = (await createTask({ status: "pending" })).body;
    await request(app).patch(`/tasks/${created.id}/complete`);

    const res = await request(app).get("/tasks/stats");
    expect(res.status).toBe(200);
    expect(res.body.statusCounts.pending).toBe(2);
    expect(res.body.statusCounts["in-progress"]).toBe(1);
    expect(res.body.statusCounts.completed).toBe(1);
  });

  it("counts overdue tasks correctly", async () => {
    await createTask({
      status: "pending",
      dueDate: "2000-01-01T00:00:00.000Z",
    });
    await createTask({
      status: "pending",
      dueDate: "2099-01-01T00:00:00.000Z",
    });
    const res = await request(app).get("/tasks/stats");
    expect(res.status).toBe(200);
    expect(res.body.overdueCount).toBe(1);
  });
});
