import express from "express";
import taskRoutes from "./routes/tasks.js";
import { fileURLToPath } from "url";

const app = express();

app.use(express.json());
app.use("/tasks", taskRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

const isMainUnit = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainUnit) {
  app.listen(PORT, () => {
  });
}

export default app;
