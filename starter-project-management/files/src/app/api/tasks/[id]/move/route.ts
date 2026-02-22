import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const body = await request.json();
    const { columnId, orderIndex } = body;

    if (typeof columnId !== "number") {
      return NextResponse.json(
        { error: "columnId is required and must be a number" },
        { status: 400 }
      );
    }

    if (typeof orderIndex !== "number") {
      return NextResponse.json(
        { error: "orderIndex is required and must be a number" },
        { status: 400 }
      );
    }

    // Verify task exists
    const [task] = await sql`
      SELECT id, project_id FROM tasks WHERE id = ${taskId}
    `;
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify column belongs to same project
    const [column] = await sql`
      SELECT id FROM columns WHERE id = ${columnId} AND project_id = ${task.project_id}
    `;
    if (!column) {
      return NextResponse.json(
        { error: "Target column not found in this project" },
        { status: 404 }
      );
    }

    const [updated] = await sql`
      UPDATE tasks
      SET column_id = ${columnId}, order_index = ${orderIndex}
      WHERE id = ${taskId}
      RETURNING *
    `;

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to move task:", error);
    return NextResponse.json(
      { error: "Failed to move task" },
      { status: 500 }
    );
  }
}
