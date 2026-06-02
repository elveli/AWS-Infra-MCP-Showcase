// Define unified types for the backend and frontend

export type ResourceStatus = "provisioning" | "available" | "modifying" | "deleted" | "error";

export interface AwsResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: ResourceStatus;
  lastUpdated: string;
}

export interface DeploymentLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  service: string;
  message: string;
  mcpContext?: boolean; 
}

export interface McpCall {
  id: string;
  timestamp: string;
  model: string;
  method: string;
  params: object;
  status: "pending" | "resolved" | "rejected";
  response?: object;
}

export interface MetricPoint {
  time: string;
  apiRequests: number;
  lambdaErrors: number;
}
