import { notFound } from "next/navigation";
import sql from "@/lib/db";
import KanbanColumn from "@/components/kanban-column";
import type { Project, Column, TaskWithAssignee } from "@/types";

export const dynamic = "force-dynamic";

async function getProject(id: number): Promise<Project | null> {
  const rows = await sql<Project[]>`
    SELECT * FROM projects WHERE id = ${id}
  `;
  return rows[0] ?? null;
}

async function getColumns(projectId: number): Promise<Column[]> {
  return sql<Column[]>`
    SELECT * FROM columns
    WHERE project_id = ${projectId}
    ORDER BY order_index ASC
  `;
}

async function getTasks(projectId: number): Promise<TaskWithAssignee[]> {
  return sql<TaskWithAssignee[]>`
    SELECT
      t.*,
      u.name AS assignee_name
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assignee_id
    WHERE t.project_id = ${projectId}
    ORDER BY t.order_index ASC
  `;
}

async function getMemberCount(projectId: number): Promise<number> {
  const rows = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM project_members WHERE project_id = ${projectId}
  `;
  return rows[0]?.count ?? 0;
}

export default async function ProjectBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) notFound();

  const [project, columns, tasks, memberCount] = await Promise.all([
    getProject(projectId),
    getColumns(projectId),
    getTasks(projectId),
    getMemberCount(projectId),
  ]);

  if (!project) notFound();

  const tasksByColumn = new Map<number, TaskWithAssignee[]>();
  for (const col of columns) {
    tasksByColumn.set(col.id, []);
  }
  for (const task of tasks) {
    const colTasks = tasksByColumn.get(task.column_id);
    if (colTasks) colTasks.push(task);
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>
        {project.description && (
          <p className="text-sm text-gray-500 mt-1 ml-7">{project.description}</p>
        )}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn.get(column.id) ?? []}
              projectId={projectId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
