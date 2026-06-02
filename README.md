# AI MCP Serverless Terraform Control Plane

A full-stack showcase application demonstrating how the **Model Context Protocol (MCP)** can be leveraged alongside AI agents for seamless AWS serverless infrastructure management, deployment tracking, and automated drift remediation.

![Control Plane Dashboard](https://img.shields.io/badge/UI-React_&_Tailwind-blue) 
![Backend](https://img.shields.io/badge/Backend-Express_&_SSE-green)
![Infrastructure](https://img.shields.io/badge/Infra-Terraform_&_AWS-purple)

## ✨ Core Features

*   🤖 **AI MCP Agent Panel**: Real-time visualization of agent context queries, reasoning, and automated tool calls (e.g., `resources/read`, `plan_terraform`).
*   📡 **Live Telemetry Stream**: Built with Server-Sent Events (SSE) to stream deployment logs, health checks, and drift detection events directly to a custom terminal UI.
*   📊 **Live Resource & API Metrics**: Real-time plotting of simulated API traffic and resource states (Provisioning, Available, Drift).
*   🏗️ **Accompanying Terraform**: Included `terraform/main.tf` structurally maps to the showcased dashboard resources (Lambda, DynamoDB, API Gateway, Kinesis).

## 🛠️ Tech Stack

*   **Frontend**: React 19, Tailwind CSS v4, Framer Motion (animations), Recharts (data viz), Lucide React (icons).
*   **Backend**: Express.js (Node.js) handling Vite SSR/Middleware, API routes, and Server-Sent Events (SSE) for the real-time simulator.
*   **Infrastructure as Code**: Terraform (`hashicorp/aws`).

## 📂 Project Structure

```text
├── src/
│   ├── components/      # React UI components (Dashboard, Terminal, Metrics, etc.)
│   ├── lib/utils.ts     # Tailwind merge utilities
│   ├── types.ts         # Shared TypeScript interfaces (Logs, Resources, MCP calls)
│   ├── App.tsx          # Main Application Layout
│   └── index.css        # Global Tailwind styling & CSS variables
├── terraform/
│   └── main.tf          # Terraform configuration for AWS resources
├── server.ts            # Express backend driving the real-time simulation & SSE
└── package.json         # Project dependencies and build scripts
```

## 🚀 Getting Started

### Running the Dashboard

The application runs as a unified full-stack Vite + Express application.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    The application will automatically boot up. If running locally, navigate to `http://localhost:3000`.

### Running the Terraform

The actual AWS infrastructure code resides in the `/terraform` directory.

1.  Navigate to the terraform directory:
    ```bash
    cd terraform
    ```
2.  Initialize and apply (Requires configured AWS CLI credentials):
    ```bash
    terraform init
    terraform plan
    terraform apply
    ```

*Note: The frontend dashboard currently runs a simulated backend loop in `server.ts` to actively showcase the MCP interactions, telemetry streaming, and drift remediations without requiring a live AWS/Terraform backend hookup.*
