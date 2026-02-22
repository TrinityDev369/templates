import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// TODO: replace with your auth provider
const userId = 1;

const DEFAULT_COLUMNS = [
  { name: "Backlog", order_index: 0 },
  { name: "To Do", order_index: 1 },
  { name: "In Progress", order_index: 2 },
  { name: "Done", order_index: 3 },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const result = await sql.begin(async (tx) => {
      // Create project
      const [project] = await tx`
        INSERT INTO projects (name, description, owner_id, color)
        VALUES (${name.trim()}, ${description ?? null}, ${userId}, ${color ?? "#6366f1"})
        RETURNING *
      `;

      // Add owner as member
      await tx`
        INSERT INTO project_members (project_id, user_id, role)
        VALUES (${project.id}, ${userId}, 'owner')
      `;

      // Create default columns
      for (const col of DEFAULT_COLUMNS) {
        await tx`
          INSERT INTO columns (project_id, name, order_index)
          VALUES (${project.id}, ${col.name}, ${col.order_index})
        `;
      }

      return project;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
