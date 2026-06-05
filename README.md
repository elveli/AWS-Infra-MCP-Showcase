# AI MCP Serverless Terraform Control Plane

A full-stack showcase application demonstrating how the **Model Context Protocol (MCP)** can be leveraged alongside AI agents for seamless AWS serverless infrastructure management, deployment tracking, and automated drift remediation.

![Control Plane Dashboard](https://img.shields.io/badge/UI-React_&_Tailwind-blue) 
![Backend](https://img.shields.io/badge/Backend-Express_&_SSE-green)
![Infrastructure](https://img.shields.io/badge/Infra-Terraform_&_AWS-purple)

## 🧠 How this demonstrates MCP (Model Context Protocol)

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is an open standard that connects AI models to external tools and live datasets. This application visualizes what a **self-healing infrastructure agent** built on MCP concepts looks like in practice:

1. **MCP Resources (Providing Context)**: An AI agent needs to know what is running. The Node.js backend represents an MCP Server, exposing live AWS telemetry (via CloudWatch and Tagging APIs) and local `terraform.tfstate` files as standardized MCP `resources`. 
2. **MCP Tools (Taking Action)**: To fix infrastructure, the AI needs actionable commands. The backend defines critical infrastructure actions (e.g., `plan_terraform`, `apply_terraform`, `check_drift`) as MCP `tools`.
3. **The Agent Loop (Visibility)**: The dedicated **AI Agent Panel** in the bottom-left of the Dashboard UI visualizes this real-time interaction. You can watch the agent passively poll context via `resources/read`, identify anomalies (Drift), and autonomously execute a `tools/call` (like `apply_terraform`) to restore state parity.

*(Note: To provide a reliable, high-speed UI demonstration without incurring constant LLM token costs, the Express backend orchestrates a simulated AI reasoning loop that behaves exactly like an MCP client, overlaying those simulated decisions onto your real AWS resource data).*

## 🔄 End-to-End Flow
How does this system actually work together?

1. **Provisioning (Terraform)**: You run `terraform apply` locally. This creates the physical infrastructure in your real AWS account. All resources are tagged with `ManagedBy = "mcp-agent"`.
2. **Telemetry & Discovery (Express.js Backend)**: The Node.js server acts as the "MCP Host". It uses the AWS SDK to query the `ResourceGroupsTaggingAPIClient` and `CloudWatchClient` to dynamically discover anything running in your account with that tag.
3. **AI Contextualization (Simulation)**: In a full MCP architecture, an AI Agent uses this data context to reason about your architecture. Our backend simulates this agent reasoning loop, deciding if infrastructure is healthy or if drift has occurred based on live remote state vs local tfstate.
4. **Real-time UI Visualization (React)**: The Express backend opens a highly efficient Server-Sent Events (SSE) stream to the React frontend, pumping a live feed of agent thoughts, telemetry metrics, and AWS resource states instantly to the dashboard.

## 🏗️ What gets installed in AWS?

When you run `terraform apply` inside the `/terraform` directory, following serverless resources are deployed. *Note: Most of these fit well within the AWS Free Tier.*

*   **AWS DynamoDB Table** (`users-table-ddb`): A Pay-Per-Request NoSQL database.
*   **AWS IAM Role** (`auth-lambda-role`): Gives execution permissions to the Lambda function.
*   **AWS Lambda Function** (`auth-lambda-func`): A Node.js compute function configured with environment variables pointing to the DynamoDB table.
*   **AWS API GatewayV2 (HTTP API)** (`prod-api-gateway`): Serves as the high-throughput entry point, routing requests to the Lambda function.
*   **AWS Kinesis Stream** (`events-stream`): A data stream to demonstrate event tracking.

## 💰 Cost Estimation (AWS)

This architecture is primarily serverless and "pay-as-you-go", meaning at rest with zero traffic, most services cost nothing. However, there is one provisioned resource.

**Estimated Hourly Cost at Rest: ~$0.015 / hour** (approx. $11.00 / month)

*   **AWS Kinesis Stream**: ~$0.015 per shard per hour. *(This is the only resource with a standing hourly charge).*
*   **DynamoDB (Pay-Per-Request)**: $0 / hour. You only pay for active database Reads/Writes.
*   **AWS Lambda & API Gateway**: $0 / hour. You only pay per request/invocation. Easily falls inside the AWS Free Tier for testing.

> **⚠️ Important:** To avoid unexpected charges, remember to run `terraform destroy` in the `/terraform` directory when you are finished showcasing or testing the application!

## 🔍 How to "See" MCP in the AWS Console

Model Context Protocol (MCP) is an open standard, not a native AWS service, so there is no dedicated "MCP Dashboard" in the AWS Console. However, you can audit and observe the MCP agent's actions in AWS through the native telemetry and auditing tools:

1. **AWS CloudTrail (The Audit Log)**: Every time the MCP agent requests context (e.g., reading resource states) or takes action (e.g., applying remediation), it uses the AWS SDK. You can view these API calls in **CloudTrail > Event history**. Look for the IAM User/Role that your MCP host is using to seeing exactly what the AI requested.
2. **AWS Resource Groups & Tag Editor**: Go to **Resource Groups > Tag Editor** and search for resources with the tag `ManagedBy : mcp-agent`. This shows you the exact blast radius of resources the MCP agent has been granted context over.
3. **Amazon CloudWatch**: If the agent detects drift and automatically remediates it (e.g., updating a DynamoDB table capacity), the resulting performance shifts and API calls will be visible in CloudWatch Metrics.

## 🎯 How to Demo the Kinesis Stream

The Kinesis Data Stream (`events-stream`) is automatically provisioned when you run `terraform apply`. To simulate live application events flowing through the system for a demo:

1. **Locate it in AWS**: Open the AWS Console, navigate to **Amazon Kinesis** -> **Data streams**, and ensure you are in the `us-west-2` region.
2. **Push a Demo Event**: You can inject a live payload into the stream directly from your laptop using the AWS CLI. Run this command to send a base64-encoded JSON payload (`{"event": "system_scale", "status": "ok"}`):
   ```bash
   aws kinesis put-record \
     --stream-name events-stream \
     --partition-key "demo-partition-01" \
     --data "eyJldmVudCI6ICJzeXN0ZW1fc2NhbGUiLCAic3RhdHVzIjogIm9rIn0=" \
     --region us-west-2
   ```
3. **Verify via AWS CLI**: To read the event you just pushed without leaving the terminal, you first need a shard iterator, then you can read the records:
   ```bash
   # 1. Get the Shard Iterator (assuming shardId-000000000000 is the only shard)
   SHARD_ITERATOR=$(aws kinesis get-shard-iterator \
     --stream-name events-stream \
     --shard-id shardId-000000000000 \
     --shard-iterator-type TRIM_HORIZON \
     --region us-west-2 \
     --query 'ShardIterator' \
     --output text)

   # 2. Read the records from the stream
   aws kinesis get-records \
     --shard-iterator $SHARD_ITERATOR \
     --region us-west-2
   ```

   *(Note: The `Data` field inside the `Records` array is returned as base64. If you see `"Records": []` in the output, Kinesis hasn't returned your event yet—you may need to run `get-records` again using the `NextShardIterator`. If you try to pipe an empty result through `jq -r '.Records[0].Data' | base64 --decode`, you will see artifact text like `e%`. This is because `jq` outputs the literal string `"null"`, which base64-decodes into garbage characters. Run the base command above first to visually verify the data is there!)*

## 🚀 Getting Started

### 1. Backend & Dashboard
1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **AWS Credentials (`.env`)**: To power the live AWS integration, create a `.env` file mimicking `.env.example`:
    ```env
    AWS_ACCESS_KEY_ID="your-access-key"
    AWS_SECRET_ACCESS_KEY="your-secret-key"
    AWS_REGION="us-west-2"
    ```
3.  **Start the Local Server:**
    ```bash
    npm run dev
    ```
    Navigate to `http://localhost:3000`.

### 2. Infrastructure (Executing Terraform from your laptop)
You do not need to enter credentials manually during the apply step if your environment is set up. Terraform reads the standard AWS credentials from your machine.

1.  Navigate and Initialize:
    ```bash
    cd terraform
    terraform init
    ```
2.  Be sure you have AWS credentials exported in your terminal session, or an active AWS CLI profile (e.g., `aws configure`).
3.  Deploy:
    ```bash
    terraform plan
    terraform apply
    ```

## 🛠️ Troubleshooting

### Error: `EADDRINUSE: address already in use 0.0.0.0:3000`
If you encounter this error when running `npm run dev`, it means another process on your laptop is already using Port 3000 (often a lingering Node server).

**To fix this on macOS/Linux:**
1. Find the hidden process ID (PID) locking the port:
   ```bash
   lsof -i :3000
   ```
2. Forcefully kill the process (replace `<PID>` with the number shown in the output):
   ```bash
   kill -9 <PID>
   ```

**To fix this on Windows:**
1. Find the PID:
   ```cmd
   netstat -ano | findstr :3000
   ```
2. Kill it:
   ```cmd
   taskkill /PID <PID> /F
   ```
After killing the zombie process, run `npm run dev` again!
