import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, columnId, priority, description, assigneeId, dueDate } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    if (!columnId || typeof columnId !== "number") {
      return NextResponse.json(
        { error: "Column ID is required" },
        { status: 400 }
      );
    }

    // Verify column belongs to project
    const [column] = await sql`
      SELECT id FROM columns WHERE id = ${columnId} AND project_id = ${projectId}
    `;
    if (!column) {
      return NextResponse.json(
        { error: "Column not found in this project" },
        { status: 404 }
      );
    }

    // Get next order index
    const [maxOrder] = await sql<{ max_order: number | null }[]>`
      SELECT MAX(order_index) AS max_order FROM tasks WHERE column_id = ${columnId}
    `;
    const orderIndex = (maxOrder?.max_order ?? -1) + 1;

    const [task] = await sql`
      INSERT INTO tasks (
        column_id, project_id, title, description, assignee_id, priority, due_date, order_index
      )
      VALUES (
        ${columnId},
        ${projectId},
        ${title.trim()},
        ${description ?? null},
        ${assigneeId ?? null},
        ${priority ?? "medium"},
        ${dueDate ?? null},
        ${orderIndex}
      )
      RETURNING *
    `;

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
