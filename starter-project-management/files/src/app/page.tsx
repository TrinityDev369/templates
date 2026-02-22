import Link from "next/link";
import sql from "@/lib/db";
import type { ProjectWithStats } from "@/types";

// TODO: replace with your auth provider
const userId = 1;

export const dynamic = "force-dynamic";

async function getProjects(): Promise<ProjectWithStats[]> {
  const rows = await sql<ProjectWithStats[]>`
    SELECT
      p.*,
      COALESCE(tc.task_count, 0)::int AS task_count,
      COALESCE(mc.member_count, 0)::int AS member_count
    FROM projects p
    INNER JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ${userId}
    LEFT JOIN (
      SELECT project_id, COUNT(*)::int AS task_count
      FROM tasks
      GROUP BY project_id
    ) tc ON tc.project_id = p.id
    LEFT JOIN (
      SELECT project_id, COUNT(*)::int AS member_count
      FROM project_members
      GROUP BY project_id
    ) mc ON mc.project_id = p.id
    ORDER BY p.created_at DESC
  `;
  return rows;
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your projects and track progress
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h2 className="text-lg font-medium text-gray-600 mb-2">No projects yet</h2>
          <p className="text-sm text-gray-400 mb-6">
            Create your first project to start managing tasks.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div
                className="h-2 rounded-t-xl"
                style={{ backgroundColor: project.color }}
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {project.task_count} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {project.member_count} members
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
