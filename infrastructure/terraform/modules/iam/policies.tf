################################################################################
# ECS Execution Role - Secrets Manager Access
################################################################################

resource "aws_iam_role_policy" "ecs_execution_secrets" {

  name = "${var.project_name}-${var.environment}-ecs-execution-secrets"

  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "secretsmanager:GetSecretValue"
        ]

        Resource = [
          var.db_secret_arn
        ]
      }
    ]
  })
}