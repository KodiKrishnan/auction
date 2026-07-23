resource "aws_iam_policy" "ecs_secret_access" {

  name        = "${var.project_name}-${var.environment}-ecs-secret-access"

  description = "Allow ECS Task Role to read Secrets Manager secrets"

  policy = data.aws_iam_policy_document.ecs_secret_access.json

}

resource "aws_iam_role_policy_attachment" "ecs_secret_access" {

  role = var.ecs_task_execution_role_name

  policy_arn = aws_iam_policy.ecs_secret_access.arn

}