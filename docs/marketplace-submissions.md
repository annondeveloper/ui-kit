# AI Marketplace Submissions

Status tracker for getting @annondeveloper/ui-kit recognized by AI platforms.

## 1. Claude Code Plugin Marketplace (Anthropic)

**Status:** Ready to submit
**URL:** Submit via PR to [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
**What to submit:** Plugin at `plugins/claude-code/`

**Submission steps:**
1. Fork `anthropics/claude-plugins-official`
2. Add entry to the marketplace.json:
```json
{
  "name": "ui-kit",
  "description": "147 zero-dependency React components with Aurora Fluid design. 5 skills, 2 agents, hosted MCP. Search components, generate code, audit accessibility.",
  "source": {
    "type": "github",
    "url": "https://github.com/annondeveloper/ui-kit.git",
    "directory": "plugins/claude-code"
  },
  "homepage": "https://github.com/annondeveloper/ui-kit"
}
```
3. Open PR with description of the plugin capabilities
4. Wait for Anthropic review

## 2. MCP Server Directory (modelcontextprotocol.io)

**Status:** Ready to submit
**URL:** https://github.com/modelcontextprotocol/servers
**What to submit:** MCP server entry

**Submission steps:**
1. Fork `modelcontextprotocol/servers`
2. Add to the community servers list in README.md:
```markdown
### UI Kit (@annondeveloper/ui-kit)
147 React components discoverable via MCP. Browse, search, generate code, access themes.
- **Hosted:** `https://ui-kit-mcp.annondeveloper.workers.dev/sse`
- **Local:** `npx @annondeveloper/ui-kit mcp`
- **Tools:** list_components, get_component, search_components, generate_snippet, get_theme, get_icons
```
3. Open PR

## 3. OpenAI Plugin/GPT Store

**Status:** Planned
**Approach:** Create a GPT that uses the MCP server's capabilities
**Steps:**
1. Create a custom GPT at https://chat.openai.com/gpts/editor
2. Name: "UI Kit Component Expert"
3. Description: "Build React UIs with 147 production components. Search, discover, generate code."
4. Add Actions pointing to the hosted API (convert MCP tools to OpenAPI spec)
5. Publish to GPT Store

**Note:** OpenAI doesn't support MCP natively yet. Need to wrap as REST API or wait for MCP support.

## 4. Cursor Marketplace

**Status:** Ready
**Approach:** Cursor supports MCP natively. Users add `.cursor/mcp.json` to their project.
**Visibility:** Submit to Cursor's MCP directory (if one exists) or create a Cursor extension.

## 5. VS Code Marketplace

**Status:** Planned
**Approach:** Create a VS Code extension that:
- Auto-configures MCP for Copilot
- Provides IntelliSense snippets for all 147 components
- Adds "UI Kit" panel in sidebar
**Package:** `annondeveloper.ui-kit-vscode`

## 6. npm/JSR Featured Packages

**Status:** Organic growth needed
**Approach:**
- Write blog posts about the zero-dependency approach
- Create YouTube tutorials
- Submit to React ecosystem newsletters (React Status, React Newsletter)
- Post on Hacker News, Reddit r/reactjs, X/Twitter

## 7. Awesome Lists

Submit to:
- [awesome-react](https://github.com/enaqx/awesome-react) — Component Libraries section
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) — MCP server directory
- [awesome-react-components](https://github.com/brillout/awesome-react-components) — UI Frameworks

## Priority Order

1. **MCP Server Directory** — highest visibility, easy PR
2. **Claude Code Marketplace** — native plugin, best integration
3. **Awesome Lists** — free visibility, easy PRs
4. **VS Code Extension** — large market, needs development
5. **GPT Store** — needs REST API wrapper
