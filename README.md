# Task Management API

**Developed by Sagar Kharal**

A robust, in-memory REST API service designed for seamless task tracking, filtering, and analytics. This project was built with a strict focus on data integrity, accurate state management, and clear contract alignment.

## 🚀 Overview

This service provides a standardized backend for managing task lifecycles. It implements strict schema validation and deterministic filtering, ensuring that clients interacting with the API receive predictable, formatted data. 

### Core Capabilities:
- **Standardized Task Creation:** Auto-generation of IDs, timestamps, and default schema statuses.
- **Accurate Pagination:** 1-indexed offset calculations ensuring seamless data chunking.
- **State Preservation:** Lifecycle updates that preserve historical metadata (like priority) while updating timestamps.
- **Dynamic Analytics:** Real-time, schema-driven generation of task statistics.

---

## 🛠️ Data Schema Contract

| Field         | Type     | Description | Valid Values / Defaults |
|--------------|----------|-------------|-------------------------|
| `id`         | String   | Unique identifier (Timestamp-based) | Auto-generated |
| `title`      | String   | The name of the task | Required |
| `description`| String   | Detailed breakdown of the task | Optional |
| `priority`   | String   | Importance level | `'low'`, `'medium'` (default), `'high'` |
| `status`     | String   | Current state of the task | `'pending'` (default), `'in-progress'`, `'completed'` |
| `dueDate`    | String   | ISO-8601 Date string | Optional |
| `assignee`   | String   | The person assigned to the task | `null` (default), Optional string |
| `createdAt`  | String   | ISO-8601 timestamp of creation | Auto-generated |
| `completedAt`| String   | ISO-8601 timestamp of completion | `null` (default), Auto-generated |

---

## 🧠 What Problems We Solved (Technical Highlights)

During the development and audit of this service, several edge cases were identified and systematically resolved to ensure enterprise-level reliability:

* **Predictable Pagination:** Realigned the `getPaginated` offset arithmetic to support 1-indexed queries (standard for REST), preventing off-by-one errors that were silently skipping results.
* **Metadata Integrity:** Refactored the update logic within the `completeTask` controller to prevent destructive overwrites of user-defined priorities upon task completion.
* **Contract Synchronization:** Unified the internal data defaults to strictly match the public API schema, eliminating undocumented states.
* **Deterministic Filtering:** Replaced fuzzy substring matching with strict equality checks (`===`) for the status filter, ensuring queries like `?status=in` do not result in accidental collisions with other statuses.
* **Dynamic Aggregation:** Overhauled the `/stats` aggregation engine to dynamically process live schema keys rather than relying on brittle, hardcoded property names.

---

## 💻 Getting Started

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Run `npm start` to initialize the server.
4. The service will run completely in-memory (data will reset upon server restart).

---

## 📝 Submission Note

**What I'd test next:**
If I had more time, I would write true boundary-value testing around the pagination offset logic. I'd specifically test `limit=0` and non-numeric query string parameters to definitively assert that `parseInt` fallbacks are ironclad. I would also write integration tests around malformed JSON parsing limits (e.g., payload too large).

**Surprises in the codebase:**
I was incredibly surprised by the Jest ESM `module is already linked` bug triggering upon concurrent imports within tests. Having to fundamentally restructure how the API exposes singleton instances across Test boundaries versus Runtime environments (via a specialized decoupled reset route instead of indirect app bindings) was a surprisingly deep technical exercise for a simple Express service! 

**Questions before shipping to production:**
1. What persistency layer are we migrating to (e.g., PostgreSQL, MongoDB), and how stringent do we need transaction locks to be when concurrently executing `completeTask` and `assignTask` against the identical row?
2. Does the authentication layer inject the tenant scoping directly into `req.user`, or will `taskService` need a robust multi-tenant wrapper?
