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
            "command": "bash -c 'cd $GITHUB_WORKSPACE && echo \"🔍 Pre-commit validation starting...\" >&2 && echo \"📁 Working in: $(pwd)\" >&2 && pnpm fmt && echo \"✅ Format check passed\" >&2 && pnpm lint && echo \"✅ Lint check passed\" >&2 && echo \"🎉 All checks passed!\" >&2 || { echo \"❌ Pre-commit validation failed\" >&2 && echo \"🚨 COMMIT BLOCKED - Fix lint/format errors and try again\" >&2 && exit 2; }'",
            "run_in_background": false
          }
        ]
      }
    ]
  }
}
EOF

echo "✅ Claude settings configured with pre-commit hook"