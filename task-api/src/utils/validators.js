import { TASK_STATUS, TASK_PRIORITY } from "../constants.js";

const VALID_STATUSES = Object.values(TASK_STATUS);
const VALID_PRIORITIES = Object.values(TASK_PRIORITY);

export const validateCreateTask = (body) => {
  if (
    !body.title ||
    typeof body.title !== "string" ||
    body.title.trim() === ""
  ) {
    return "Invalid or missing 'title'. It must be a non-empty string.";
  }
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return `Invalid 'status' provided. Expected one of: ${VALID_STATUSES.join(", ")}.`;
  }
  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    return `Invalid 'priority' provided. Expected one of: ${VALID_PRIORITIES.join(", ")}.`;
  }
  if (body.dueDate && isNaN(Date.parse(body.dueDate))) {
    return "Invalid 'dueDate'. It must be a properly formatted ISO date string.";
  }
  return null;
};

export const validateUpdateTask = (body) => {
  if (
    body.title !== undefined &&
    (typeof body.title !== "string" || body.title.trim() === "")
  ) {
    return "Invalid 'title'. If provided, it must be a non-empty string.";
  }
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return `Invalid 'status' provided. Expected one of: ${VALID_STATUSES.join(", ")}.`;
  }
  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    return `Invalid 'priority' provided. Expected one of: ${VALID_PRIORITIES.join(", ")}.`;
  }
  if (body.dueDate && isNaN(Date.parse(body.dueDate))) {
    return "Invalid 'dueDate'. It must be a properly formatted ISO date string.";
  }
  return null;
};

export const validateAssignTask = (body) => {
  if (
    !body.assignee ||
    typeof body.assignee !== "string" ||
    body.assignee.trim() === ""
  ) {
    return "Invalid or missing 'assignee'. It must be a non-empty string representing the user's name.";
  }
  return null;
};
