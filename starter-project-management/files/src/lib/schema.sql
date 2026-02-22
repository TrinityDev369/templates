-- Project Management Schema
-- Run: psql $DATABASE_URL -f src/lib/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS columns (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  color TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  assignee_id INTEGER REFERENCES users(id),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_labels (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Seed data
-- Seed requires a user with id=1 to exist. Create one first or adjust the seed.
INSERT INTO users (id, name, email) VALUES
  (1, 'Demo User', 'demo@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO projects (id, name, description, owner_id, color) VALUES
  (1, 'My First Project', 'A sample project to get you started with task management.', 1, '#6366f1')
ON CONFLICT DO NOTHING;

INSERT INTO project_members (project_id, user_id, role) VALUES
  (1, 1, 'owner')
ON CONFLICT DO NOTHING;

INSERT INTO columns (id, project_id, name, order_index) VALUES
  (1, 1, 'Backlog', 0),
  (2, 1, 'To Do', 1),
  (3, 1, 'In Progress', 2),
  (4, 1, 'Done', 3)
ON CONFLICT DO NOTHING;

INSERT INTO tasks (id, column_id, project_id, title, description, priority, order_index) VALUES
  (1, 1, 1, 'Define project requirements', 'Gather and document all project requirements from stakeholders.', 'high', 0),
  (2, 2, 1, 'Set up development environment', 'Install dependencies and configure local dev tools.', 'medium', 0),
  (3, 3, 1, 'Design database schema', 'Create the initial database schema for the application.', 'high', 0)
ON CONFLICT DO NOTHING;

-- Reset sequences to avoid conflicts with seed data
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);
SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 0) + 1, false);
SELECT setval('columns_id_seq', COALESCE((SELECT MAX(id) FROM columns), 0) + 1, false);
SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 0) + 1, false);
