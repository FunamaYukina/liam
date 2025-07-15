#!/bin/bash

# Create Claude settings directory
mkdir -p ~/.claude

# Create settings.json with hooks configuration
# Note: Using environment variable expansion here
cat > ~/.claude/settings.json << EOF
{
  "enableAllProjectMcpServers": true,
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__github_file_ops__commit_files",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'cd $GITHUB_WORKSPACE && echo \"🔍 Pre-commit validation starting...\" >&2 && echo \"📁 Working in: $(pwd)\" >&2 && FMT_OUTPUT=$(pnpm fmt 2>&1) && FMT_CODE=$? && if [ $FMT_CODE -ne 0 ]; then echo \"❌ Format check failed (exit $FMT_CODE):\" >&2 && echo \"$FMT_OUTPUT\" >&2 && echo \"🚨 COMMIT BLOCKED: You MUST fix all format issues before committing\" >&2 && echo \"🔧 Run: pnpm fmt\" >&2 && exit 2; fi && echo \"✅ Format check passed\" >&2 && LINT_OUTPUT=$(pnpm lint 2>&1) && LINT_CODE=$? && if [ $LINT_CODE -ne 0 ]; then echo \"❌ Lint check failed (exit $LINT_CODE):\" >&2 && echo \"$LINT_OUTPUT\" >&2 && echo \"🚨 COMMIT BLOCKED: You MUST fix all lint violations before committing\" >&2 && echo \"🔧 Step 1: Run pnpm lint --fix (auto-fixes what it can)\" >&2 && echo \"🔧 Step 2: Manually fix remaining violations\" >&2 && echo \"🔧 Step 3: Run pnpm lint again to verify all issues are resolved\" >&2 && echo \"💡 DO NOT disable lint rules - fix the code instead!\" >&2 && exit 2; fi && echo \"✅ Lint check passed\" >&2 && echo \"🎉 All checks passed!\" >&2'",
            "run_in_background": false
          }
        ]
      }
    ]
  }
}
EOF

echo "✅ Claude settings configured with pre-commit hook"
echo "📄 Settings.json content:"
cat ~/.claude/settings.json
echo ""
echo "🔍 Hook script path: ${GITHUB_WORKSPACE}/.github/scripts/pre-commit-hook.sh"
echo "📁 Hook script exists: $([ -f "${GITHUB_WORKSPACE}/.github/scripts/pre-commit-hook.sh" ] && echo "YES" || echo "NO")"
echo "🔐 Hook script executable: $([ -x "${GITHUB_WORKSPACE}/.github/scripts/pre-commit-hook.sh" ] && echo "YES" || echo "NO")"