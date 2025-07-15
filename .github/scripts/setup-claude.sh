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
            "command": "bash -c '${GITHUB_WORKSPACE}/.github/scripts/pre-commit-hook.sh'",
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