# TODOS

## Phase 0 — COMPLETE

### ~~[P0] MCP Server Integration Tests~~ DONE
48 integration tests covering all 6 tools + resource system. `src/__tests__/mcp/server.test.ts`

### ~~[P0] CLI `mcp` Subcommand~~ DONE
`src/cli/commands/mcp-setup.ts`. Auto-detects OS, merges config, confirmation prompt.

### ~~[P0] Fix generate_snippet Fallback Types~~ DONE
Union types, functions, arrays, objects all produce valid JSX now.

### ~~[P0] Verify Dependency Isolation~~ DONE
`@modelcontextprotocol/sdk` moved to `optionalDependencies`.

### ~~[P0] Fix Storybook CI~~ DONE
`continue-on-error` removed from `.github/workflows/deploy-demo.yml`.

### ~~[P0] SSE Session Cleanup~~ DONE
30-min idle timeout, cleanup interval, disconnect handling.

### ~~[P0] MCP Analytics~~ DONE
`src/mcp/analytics.ts` + `logToolCall()` in all 6 tools + `stats` CLI command.

### ~~[P0] Update CLAUDE.md~~ DONE
Performance budgets reconciled, CLI commands updated, MCP section added, version bumped.

### ~~[P0] Good First Issues~~ DONE
5 issues created: #2-#6 on GitHub.

### ~~[P0] Component Example Audit~~ DONE
All 156 components have auto-generated examples (100% coverage). Quality is scaffold-level.

## Phase 1 — COMPLETE

### ~~[P1] README Rewrite~~ DONE
AI-native angle, "Made for AI Assistants" badge, How It Works 3-step flow, MCP Server section.

### ~~[P1] Landing Page Rewrite~~ DONE
Hero: "The first component library built for AI agents". CTA: "Set Up MCP". Stats: "6 MCP Tools".

### ~~[P1] MCP Setup Guide~~ DONE
`docs/guides/mcp-setup.md`. Quick setup, manual config, example prompts, troubleshooting.

## Phase 1 Remaining

### [P1] MCP Demo Video
60-second recording. Pre-recording checklist: run flow 10x, target 9/10 clean runs.
- Not automatable — manual recording task.

## Phase 1 Post (from eng review)

### [P1] MCP Server Error Handling
Add try/catch to all 6 tool handlers in server.ts. Return structured error responses.
- **GitHub Issue:** #6

### [P1] Revise Launch Timeline
Private beta takes ~1 week for recruitment. Adjust Phase 2 dates accordingly.

## Phase 2 (Community Launch)

### [P2] X/Twitter Thread
Demo video + "I built a component library that AI agents can use natively via MCP"

### [P2] Hacker News Show HN
Target: April 15-16, 2026. Hard deadline: April 23.
Title: "Show HN: AI-native React component library with MCP server (147 components, zero deps)"

### [P2] Reddit Posts
r/reactjs + r/webdev, educational angle on MCP.

### [P2] Dev.to Blog Post
"How I built a component library that AI agents can understand"

## Phase 3 (Iterate)

### [P3] MCP Protocol Versioning
Strategy for tool/schema changes across versions.

### [P3] Integration Guides
Cursor, Copilot, Windsurf specific setup guides.

### [P3] Competitive Monitoring
Weekly check if shadcn/MUI/Radix ship MCP servers.
