# terraform/main.tf

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Default Provider
provider "aws" {
  region = "us-west-2"
}

# ==========================================
# 1. DynamoDB Table (users-table-ddb)
# ==========================================
resource "aws_dynamodb_table" "users_table" {
  name           = "users-table-ddb"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "UserId"

  attribute {
    name = "UserId"
    type = "S"
  }

  tags = {
    Environment = "production"
    ManagedBy   = "mcp-agent"
  }
}

# ==========================================
# 2. Lambda Function (auth-lambda-func)
# ==========================================
resource "aws_iam_role" "lambda_exec" {
  name = "auth-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

data "archive_file" "lambda_dummy" {
  type        = "zip"
  output_path = "${path.module}/dummy_payload.zip"

  source {
    content  = <<EOF
exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Dummy Payload!'),
  };
};
EOF
    filename = "index.js"
  }
}

resource "aws_lambda_function" "auth_lambda" {
  function_name = "auth-lambda-func"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"

  # Uses a dynamically generated zip file
  filename         = data.archive_file.lambda_dummy.output_path
  source_code_hash = data.archive_file.lambda_dummy.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.users_table.name
    }
  }
}

# ==========================================
# 3. API Gateway (prod-api-gateway)
# ==========================================
resource "aws_apigatewayv2_api" "prod_api" {
  name          = "prod-api-gateway"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.prod_api.id
  integration_type = "AWS_PROXY"
  integration_uri    = aws_lambda_function.auth_lambda.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.prod_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# ==========================================
# 4. Kinesis Stream (events-stream)
# ==========================================
resource "aws_kinesis_stream" "events_stream" {
  name             = "events-stream"
  shard_count      = 1
  retention_period = 24
}
