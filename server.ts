import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { AwsResource, DeploymentLog, McpCall, MetricPoint } from "./src/types";

// --- Mock Data & State ---
let resources: AwsResource[] = [
  { id: "res-1", name: "prod-api-gateway", type: "AWS::ApiGateway::RestApi", region: "us-east-1", status: "available", lastUpdated: new Date().toISOString() },
  { id: "res-2", name: "auth-lambda-func", type: "AWS::Lambda::Function", region: "us-east-1", status: "available", lastUpdated: new Date().toISOString() },
  { id: "res-3", name: "users-table-ddb", type: "AWS::DynamoDB::Table", region: "us-east-1", status: "available", lastUpdated: new Date().toISOString() },
  { id: "res-4", name: "events-stream", type: "AWS::Kinesis::Stream", region: "eu-west-1", status: "available", lastUpdated: new Date().toISOString() }
];

let mcpHistory: McpCall[] = [
  {
    id: "mcp-req-001",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    model: "claude-3-5-sonnet",
    method: "resources/read",
    params: { tf_state: "production" },
    status: "resolved",
    response: { resource_count: 4, drift_detected: false }
  }
];

let metrics: MetricPoint[] = Array.from({ length: 20 }, (_, i) => ({
  time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  apiRequests: Math.floor(Math.random() * 500) + 100,
  lambdaErrors: Math.floor(Math.random() * 10)
}));

// Create a simple pub/sub for SSE listeners
const clients: { id: number, res: express.Response }[] = [];

function broadcastLog(log: DeploymentLog) {
  const data = `data: ${JSON.stringify(log)}\n\n`;
  clients.forEach(client => client.res.write(data));
}

function broadcastResourceUpdate() {
  const data = `event: resources\ndata: ${JSON.stringify(resources)}\n\n`;
  clients.forEach(client => client.res.write(data));
}

// Background simulator loop
setInterval(() => {
  const r = Math.random();
  if (r < 0.15) {
    // Simulate an AI using MCP to query or act
    const mcpMethods = ["resources/read", "tools/call", "prompts/list"];
    const tools = ["plan_terraform", "apply_terraform", "check_drift"];
    
    const method = mcpMethods[Math.floor(Math.random() * mcpMethods.length)];
    const mcpLog: DeploymentLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: "info",
      service: "[AI Agent MCP]",
      message: method === "tools/call" 
        ? `Called tool: ${tools[Math.floor(Math.random() * tools.length)]}` 
        : `Requested context via ${method}`,
      mcpContext: true
    };
    broadcastLog(mcpLog);

    mcpHistory.unshift({
      id: `mcp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      model: "system-agent",
      method,
      params: { auto_remediation: true },
      status: "resolved"
    });
    if (mcpHistory.length > 10) mcpHistory.length = 10;
  } else if (r < 0.25) {
    // Simulate Terraform Drift Detection
    broadcastLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: "warn",
      service: "tf-observer",
      message: "Drift detected on AWS::DynamoDB::Table 'users-table-ddb'. Resolving..."
    });
    
    setTimeout(() => {
      broadcastLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: "success",
        service: "mcp-agent",
        message: "Applied tf state correction automatically. Parity restored.",
        mcpContext: true
      });
    }, 3000);
  } else if (r < 0.6) {
    // Normal routine log
    const services = ["api-gateway", "lambda-edge", "cloudwatch"];
    broadcastLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: "info",
      service: services[Math.floor(Math.random() * services.length)],
      message: `Health check passed. Latency: ${Math.floor(Math.random() * 50 + 10)}ms`
    });
  }

  // Update metrics
  metrics.shift();
  metrics.push({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    apiRequests: Math.floor(Math.random() * 500) + 100,
    lambdaErrors: Math.floor(Math.random() * 8)
  });

}, 4000);

// --- Server Setup ---
async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parsing
  app.use(express.json());

  // API Routes
  app.get("/api/resources", (req, res) => {
    res.json(resources);
  });

  app.get("/api/mcp", (req, res) => {
    res.json(mcpHistory);
  });

  app.get("/api/metrics", (req, res) => {
    res.json(metrics);
  });

  // SSE stream for real-time logs and updates
  app.get("/api/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const clientId = Date.now();
    clients.push({ id: clientId, res });

    req.on("close", () => {
      const index = clients.findIndex((c) => c.id === clientId);
      if (index !== -1) clients.splice(index, 1);
    });
    
    // Send initial connection log
    res.write(`data: ${JSON.stringify({
      id: 'init',
      timestamp: new Date().toISOString(),
      level: 'success',
      service: 'system',
      message: 'Established real-time secure stream with MCP host.'
    })}\n\n`);
  });

  // Vite Middleware OR Static folder
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
