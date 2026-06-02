# AI MCP Serverless Terraform Control Plane

A full-stack showcase application demonstrating how the **Model Context Protocol (MCP)** can be leveraged alongside AI agents for seamless AWS serverless infrastructure management, deployment tracking, and automated drift remediation.

![Control Plane Dashboard](https://img.shields.io/badge/UI-React_&_Tailwind-blue) 
![Backend](https://img.shields.io/badge/Backend-Express_&_SSE-green)
![Infrastructure](https://img.shields.io/badge/Infra-Terraform_&_AWS-purple)

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
*   **AWS Kinesis Stream** (`events-stream`): A data stream deployed specifically in `eu-west-1` to demonstrate cross-region infrastructure tracking.

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
