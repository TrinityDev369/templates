#!/usr/bin/env node
/**
 * kg - Standalone CLI for the Context Graph
 *
 * Zero external dependencies. Uses native fetch (Node 18+).
 * 9 subcommands matching the trinity kg interface.
 */
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

// -- Config -------------------------------------------------------------------

const API = process.env.KNOWLEDGE_API_URL || "http://localhost:8100";

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) throw new Error(`API error (${res.status}): ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}

// -- Arg parsing --------------------------------------------------------------

function parseArgs(argv) {
  const flags = {}, positional = [];
  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq !== -1) flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      else flags[arg.slice(2)] = true;
    } else positional.push(arg);
  }
  return {
    command: positional[0], args: positional.slice(1),
    project: flags.project || undefined,
    type: flags.type || undefined,
    mode: flags.mode || "hybrid",
    depth: flags.depth ? Number(flags.depth) : 1,
    limit: flags.limit ? Number(flags.limit) : 10,
    description: flags.description || undefined,
    json: !!flags.json, help: !!flags.help,
  };
}

// -- Helpers ------------------------------------------------------------------

function requireProject(p) {
  if (!p) { console.error("ERROR: --project is required\nRun 'kg projects' to see available graphs"); process.exit(1); }
  return p;
}
function truncate(t, max) { return !t ? "" : t.length > max ? t.slice(0, max - 3) + "..." : t; }
function sourceTag(s) { return s === "vector" ? "[V]" : "[G]"; }
function unwrap(r, k) { return Array.isArray(r) ? r : r?.[k] ?? []; }
function jsonOut(d) { console.log(JSON.stringify(d, null, 2)); }

// -- Subcommands --------------------------------------------------------------

async function cmdProjects(opts) {
  const projects = unwrap(await api("/api/v1/projects"), "projects");
  if (opts.json) return jsonOut(projects);
  console.log(`KG PROJECTS (${projects.length} graphs)\n`);
  for (const p of projects) {
    const desc = p.description ? `  ${truncate(p.description, 50)}` : "";
    console.log(`  ${(p.slug || p.name).padEnd(20)}${desc}`);
  }
}

async function cmdSearch(opts) {
  const query = opts.args.join(" ");
  if (!query) { console.error("Usage: kg search <query> [--project=...] [--mode=hybrid]"); process.exit(1); }
  const body = { query, mode: opts.mode, limit: opts.limit };

  if (opts.project) {
    const raw = await api(`/api/v1/projects/${opts.project}/search`, { method: "POST", body: JSON.stringify(body) });
    const results = unwrap(raw, "results");
    if (opts.json) return jsonOut({ project: opts.project, query, results });
    console.log(`KG SEARCH: "${query}" (${opts.mode}, project: ${opts.project})`);
    console.log(`Found ${results.length} results\n`);
    printResults(results);
  } else {
    const raw = await api("/api/v1/search", { method: "POST", body: JSON.stringify(body) });
    const results = raw.results || [], total = raw.total || results.length;
    const stats = raw.project_stats || [];
    if (opts.json) return jsonOut(raw);
    const info = stats.map((s) => `${s.project}:${s.result_count}`).join(", ");
    console.log(`KG SEARCH: "${query}" (${opts.mode}, cross-graph, ${raw.projects_searched || 0} projects)`);
    console.log(`Found ${total} results (${info})\n`);
    printResults(results);
  }
}

function printResults(results) {
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const proj = r.project ? ` [${r.project}]` : "";
    const type = r.label || r.type || "Unknown";
    console.log(`[${i + 1}] (${Number(r.score).toFixed(2)}) ${sourceTag(r.source)} ${r.name} (${type})${proj}`);
    const desc = r.content || r.description;
    if (desc) console.log(`    ${truncate(desc, 100)}`);
  }
}

async function cmdFocus(opts) {
  const project = requireProject(opts.project);
  const id = opts.args[0];
  if (!id) { console.error("Usage: kg focus <id|name> --project=<slug>"); process.exit(1); }

  let entityId, entityName, entityType;
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || /^\d+$/.test(id);

  if (isId) {
    const e = await api(`/api/v1/projects/${project}/entities/${id}`);
    entityId = e.id; entityName = e.name; entityType = e.type;
  } else {
    const found = unwrap(await api(`/api/v1/projects/${project}/entities/find?name=${encodeURIComponent(id)}`), "entities");
    if (!found.length) { console.error(`ERROR: No entity matching "${id}" in ${project}`); process.exit(1); }
    entityId = found[0].id; entityName = found[0].name; entityType = found[0].type;
  }

  const rels = unwrap(await api(`/api/v1/projects/${project}/entities/${entityId}/relationships`), "relationships");
  if (opts.json) return jsonOut({ id: entityId, name: entityName, type: entityType, project, relationships: rels });

  console.log(`FOCUS: ${entityName} (${entityType}) [${project}]\n`);
  const out = rels.filter((r) => r.direction === "outgoing");
  const inc = rels.filter((r) => r.direction === "incoming");
  if (out.length) { console.log(`OUTGOING (${out.length}):`); for (const r of out) console.log(`  ${r.type} -> ${r.other_name} (${r.other_type})`); }
  if (inc.length) { if (out.length) console.log(""); console.log(`INCOMING (${inc.length}):`); for (const r of inc) console.log(`  ${r.type} <- ${r.other_name} (${r.other_type})`); }
  if (!out.length && !inc.length) console.log("No relationships found.");
}

async function cmdList(opts) {
  const project = requireProject(opts.project);
  const params = new URLSearchParams();
  if (opts.type) params.set("type", opts.type);
  if (opts.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  const entities = unwrap(await api(`/api/v1/projects/${project}/entities${qs ? `?${qs}` : ""}`), "entities");
  if (opts.json) return jsonOut(entities);

  const label = opts.type ? ` type=${opts.type}` : "";
  console.log(`KG LIST: ${project}${label} (${entities.length} entities)\n`);
  for (const e of entities) {
    const desc = e.description || e.properties?.description;
    console.log(`  ${e.name} (${e.type})${desc ? ` -- ${truncate(desc, 60)}` : ""}`);
    console.log(`    id: ${e.id}`);
  }
}

async function cmdStats(opts) {
  const project = requireProject(opts.project);
  const info = await api(`/api/v1/projects/${project}`);
  const entities = unwrap(await api(`/api/v1/projects/${project}/entities?limit=1000`), "entities");

  const typeCounts = {};
  for (const e of entities) typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  if (opts.json) return jsonOut({ project: info, entity_count: entities.length, type_breakdown: typeCounts });

  console.log(`KG STATS: ${project}\n`);
  console.log(`  Name:          ${info.name}`);
  if (info.description) console.log(`  Description:   ${info.description}`);
  console.log(`  Entities:      ${info.entity_count ?? entities.length}`);
  if (info.relationship_count !== undefined) console.log(`  Relationships: ${info.relationship_count}`);

  const entries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  if (entries.length) {
    console.log(`\n  BY TYPE:`);
    for (const [type, count] of entries) console.log(`    ${type.padEnd(20)} ${count}`);
  }
}

async function cmdAdd(opts) {
  const project = requireProject(opts.project);
  const name = opts.args.join(" ");
  if (!name) { console.error('Usage: kg add "Name" --type=Concept --project=knowledge'); process.exit(1); }
  if (!opts.type) { console.error("ERROR: --type is required for kg add"); process.exit(1); }

  const body = { name, type: opts.type };
  if (opts.description) body.description = opts.description;
  const result = await api(`/api/v1/projects/${project}/entities`, { method: "PUT", body: JSON.stringify(body) });
  if (opts.json) return jsonOut(result);

  console.log(`${result.created ? "ADDED" : "UPDATED"}: ${result.name} (${result.type}) [${project}]`);
  console.log(`ID: ${result.id}`);
  if (result.merged_properties?.length) console.log(`Merged: ${result.merged_properties.join(", ")}`);
}

async function cmdConnect(opts) {
  const project = requireProject(opts.project);
  if (opts.args.length < 2) { console.error("Usage: kg connect <from> <to> --type=DEPENDS_ON --project=codebase"); process.exit(1); }
  if (!opts.type) { console.error("ERROR: --type is required for kg connect"); process.exit(1); }

  const [fromId, toId] = opts.args;
  const result = await api(`/api/v1/projects/${project}/relationships`, {
    method: "POST", body: JSON.stringify({ source_id: fromId, target_id: toId, type: opts.type }),
  });
  if (opts.json) return jsonOut(result);
  console.log(`CONNECTED: ${fromId} -[${result.type}]-> ${toId} [${project}]`);
  console.log(`ID: ${result.id}`);
}

async function cmdIngest(opts) {
  const project = requireProject(opts.project);
  const filePath = opts.args[0];
  if (!filePath) { console.error("Usage: kg ingest <file> --project=knowledge"); process.exit(1); }

  let content;
  try { content = await readFile(filePath, "utf-8"); }
  catch (err) { console.error(`ERROR: Cannot read file: ${filePath}\n${err.message}`); process.exit(1); }

  const filename = basename(filePath);
  console.log(`Ingesting ${filename} (${content.length} chars) into ${project}...`);

  const doc = await api(`/api/v1/projects/${project}/documents`, {
    method: "POST", body: JSON.stringify({ filename, raw_content: content, content_type: "general" }),
  });
  console.log(`Document created: ${doc.id}\nProcessing...`);

  const result = await api(`/api/v1/projects/${project}/documents/${doc.id}/process`, { method: "POST" });
  if (opts.json) return jsonOut({ document: doc, processing: result });

  console.log(`INGESTED: ${filename} [${project}]`);
  console.log(`  Status: ${result.status}`);
  if (result.chunks_created !== undefined) console.log(`  Chunks: ${result.chunks_created}`);
  if (result.entities_extracted !== undefined) console.log(`  Entities extracted: ${result.entities_extracted}`);
}

async function cmdCypher(opts) {
  const project = requireProject(opts.project);
  const query = opts.args.join(" ");
  if (!query) { console.error('Usage: kg cypher "MATCH (n) RETURN n LIMIT 5" --project=codebase'); process.exit(1); }

  const raw = await api(`/api/v1/projects/${project}/query/cypher`, {
    method: "POST", body: JSON.stringify({ query }),
  });
  const results = Array.isArray(raw) ? raw : raw.results || raw.rows || [];
  if (opts.json) return jsonOut(results);

  if (!results.length) { console.log("CYPHER: 0 rows returned"); return; }

  const keys = Object.keys(results[0]);
  const widths = {};
  for (const k of keys) {
    widths[k] = k.length;
    for (const row of results) widths[k] = Math.max(widths[k], String(row[k] ?? "").length);
    widths[k] = Math.min(widths[k], 40);
  }

  console.log(`CYPHER: ${results.length} rows\n`);
  console.log(`  ${keys.map((k) => k.padEnd(widths[k])).join("  ")}`);
  console.log(`  ${keys.map((k) => "-".repeat(widths[k])).join("  ")}`);
  for (const row of results) {
    console.log(`  ${keys.map((k) => truncate(String(row[k] ?? ""), widths[k]).padEnd(widths[k])).join("  ")}`);
  }
}

// -- Help ---------------------------------------------------------------------

const HELP = `kg - Knowledge Graph CLI

USAGE:  kg <command> [args] [options]

READ:
  projects               List all graph domains
  search <query>         Hybrid search (cross-graph by default)
  focus <id|name>        Entity neighborhood (requires --project)
  list                   List entities (requires --project)
  stats                  Graph statistics (requires --project)

WRITE:
  add <name>             Upsert entity (requires --project, --type)
  connect <from> <to>    Create relationship (requires --project, --type)
  ingest <file>          Ingest document for RAG (requires --project)

POWER:
  cypher <query>         Raw Cypher query (requires --project)

OPTIONS:
  --project=<slug>       Target graph (codebase, knowledge, agency, ...)
  --type=<t>             Entity or relationship type
  --mode=hybrid|vector|graph   Search mode (default: hybrid)
  --depth=<N>            Traversal depth (default: 1)
  --limit=<N>            Max results (default: 10)
  --description=<text>   Entity description (for add)
  --json                 Machine-readable JSON output

ENV:  KNOWLEDGE_API_URL  (default: http://localhost:8100)

EXAMPLES:
  kg projects
  kg search "auth middleware"
  kg search "auth" --project=codebase --limit=3
  kg list --project=codebase --type=Module
  kg focus "Auth System" --project=codebase
  kg add "CVA Pattern" --type=Concept --project=knowledge --description="Use CVA"
  kg connect <id1> <id2> --type=RELATED_TO --project=knowledge
  kg ingest specs/feature.md --project=knowledge
  kg cypher "MATCH (n) RETURN labels(n)[0], count(n)" --project=codebase
`;

// -- Router -------------------------------------------------------------------

const COMMANDS = { projects: cmdProjects, search: cmdSearch, focus: cmdFocus, list: cmdList, stats: cmdStats, add: cmdAdd, connect: cmdConnect, ingest: cmdIngest, cypher: cmdCypher };

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.command || opts.help) { process.stdout.write(HELP); return; }

  const handler = COMMANDS[opts.command];
  if (!handler) { console.error(`ERROR: Unknown command '${opts.command}'\nAvailable: ${Object.keys(COMMANDS).join(", ")}`); process.exit(1); }

  try { await handler(opts); }
  catch (err) {
    if (opts.json) jsonOut({ error: err.message });
    else console.error(`KG ERROR: ${err.message}`);
    process.exit(1);
  }
}

main();
