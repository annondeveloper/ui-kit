# Dockerfile for Glama MCP server listing
# Builds and runs the ui-kit MCP server in stdio mode
FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY dist/ dist/

# The MCP server entry point
ENTRYPOINT ["node", "dist/mcp/index.js"]
