#!/bin/bash
cd $GITHUB_WORKSPACE
echo "🔍 Pre-commit validation starting..." >&2
echo "📁 Working in: $(pwd)" >&2

# Format check
FMT_OUTPUT=$(pnpm fmt 2>&1)
FMT_CODE=$?
if [ $FMT_CODE -ne 0 ]; then
    echo "❌ Format check failed (exit $FMT_CODE):" >&2
    echo "$FMT_OUTPUT" >&2
    echo "🔧 Fix: Run pnpm fmt" >&2
    exit 2
fi
echo "✅ Format check passed" >&2

# Lint check
LINT_OUTPUT=$(pnpm lint 2>&1)
LINT_CODE=$?
if [ $LINT_CODE -ne 0 ]; then
    echo "❌ Lint check failed (exit $LINT_CODE):" >&2
    echo "$LINT_OUTPUT" >&2
    echo "🔧 Fix: Run pnpm lint --fix, then pnpm lint" >&2
    exit 2
fi
echo "✅ Lint check passed" >&2
echo "🎉 All checks passed!" >&2