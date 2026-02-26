#!/bin/bash
# spawn-phase.sh — Single-phase Claude CLI spawner
# Reads phase config, generates focus, renders prompt, spawns claude

# Spawn a single pipeline phase
# Usage: spawn_phase <phase_name> <worktree_dir> <description> <slug> <project_root> [KEY VALUE ...]
spawn_phase() {
  local phase_name="$1"
  local worktree_dir="$2"
  local description="$3"
  local slug="$4"
  local project_root="$5"
  shift 5

  local pipeline_dir="$project_root/pipeline"
  local config_json
  config_json=$(cat "$pipeline_dir/phases/${phase_name}.json")

  # Extract all phase settings in one python3 call (was 4 separate calls)
  local phase_settings
  phase_settings=$(python3 -c "
import json, sys
c = json.loads(sys.argv[1])
print(c.get('model', 'sonnet'))
print(c.get('tools', ''))
print(c.get('promptTemplate', ''))
print(json.dumps(c.get('affinities', [])))
" "$config_json")

  local phase_model phase_tools prompt_template affinities_json
  { read -r phase_model; read -r phase_tools; read -r prompt_template; read -r affinities_json; } <<< "$phase_settings"

  [ -n "$MODEL_OVERRIDE" ] && phase_model="$MODEL_OVERRIDE"

  # Generate .claudeignore for this phase's focus
  echo "  Generating focus (.claudeignore) for $phase_name phase..."
  generate_claudeignore "$config_json" "$worktree_dir" "$slug"

  # Assemble context from context files listed in phase config
  echo "  Assembling context..."
  local context
  context=$(assemble_phase_context "$config_json" "$description" "$project_root")

  # Read prompt template and render all placeholders in a single python3 call.
  # Extra vars (SPEC_CONTENT, DIFF, REVIEW_CONTENT) are passed as trailing KEY VALUE pairs.
  local rendered_prompt
  rendered_prompt=$(cat "$pipeline_dir/prompts/$prompt_template")

  local current_date
  current_date=$(date +%Y-%m-%d)

  # Build a single python3 invocation that handles both fixed and extra replacements
  local -a render_args=("$rendered_prompt" "$description" "$slug" "$current_date" "$context")

  local extra_python=""
  local arg_idx=6
  while [ $# -gt 0 ]; do
    local var_name="$1"
    local var_value="$2"
    shift 2 2>/dev/null || break
    render_args+=("$var_value")
    extra_python="${extra_python}template = template.replace('{{${var_name}}}', sys.argv[${arg_idx}])
"
    arg_idx=$((arg_idx + 1))
  done

  rendered_prompt=$(python3 -c "
import sys
template = sys.argv[1]
template = template.replace('{{DESCRIPTION}}', sys.argv[2])
template = template.replace('{{SLUG}}', sys.argv[3])
template = template.replace('{{DATE}}', sys.argv[4])
template = template.replace('{{CONTEXT}}', sys.argv[5])
${extra_python}print(template)
" "${render_args[@]}")

  # Save rendered prompt for debugging
  local prompt_file="$LOG_DIR/pbr-${RUN_ID}-${phase_name}.prompt.md"
  echo "$rendered_prompt" > "$prompt_file"

  local log_file="$LOG_DIR/pbr-${RUN_ID}-${phase_name}.log"

  if [ "$DRY_RUN" = "true" ]; then
    echo ""
    echo "  === DRY RUN: $phase_name ==="
    echo "  Model: $phase_model"
    echo "  Tools: $phase_tools"
    echo "  Prompt: $prompt_file"
    echo "  .claudeignore: $worktree_dir/.claudeignore"
    echo ""
    echo "  --- .claudeignore contents ---"
    sed 's/^/  /' "$worktree_dir/.claudeignore"
    echo ""
    echo "  --- Rendered prompt (first 80 lines) ---"
    head -80 "$prompt_file" | sed 's/^/  /'
    echo "  [...]"
    return 0
  fi

  # Build claude command
  local -a claude_args=(--model "$phase_model" --dangerously-skip-permissions)
  [ -n "$phase_tools" ] && claude_args+=(--allowedTools "$phase_tools")

  echo "  Spawning $phase_name agent (model: $phase_model)..."
  echo ""

  # Run in subshell to avoid polluting caller's cwd
  (cd "$worktree_dir" && claude "${claude_args[@]}" -p < "$prompt_file" 2>&1) | tee "$log_file"
  local exit_code=${PIPESTATUS[0]}

  echo ""
  echo "  Phase log: $log_file"

  return $exit_code
}
