################################################################################
# ECS Task Execution Role
#
# Purpose:
# - Pull container images from Amazon ECR
# - Push logs to Amazon CloudWatch Logs
# - ECS agent operations
#
# Note:
# Do NOT grant application permissions (Secrets Manager, S3, SES, etc.)
# to this role. Those belong to the ECS Task Role.
################################################################################

################################################################################
# Shared ECS Trust Policy
################################################################################

data "aws_iam_policy_document" "ecs_task_assume_role" {

  statement {
    sid    = "ECSTasksAssumeRole"
    effect = "Allow"

    actions = [
      "sts:AssumeRole"
    ]

    principals {
      type = "Service"

      identifiers = [
        "ecs-tasks.amazonaws.com"
      ]
    }
  }
}

################################################################################
# ECS Task Execution Role
################################################################################

resource "aws_iam_role" "ecs_task_execution" {

  name = "${var.project_name}-${var.environment}-ecs-task-execution-role"

  description = "IAM role assumed by Amazon ECS to pull images and publish logs."

  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json

  tags = var.tags
}

################################################################################
# AWS Managed Policy Attachment
################################################################################

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {

  role = aws_iam_role.ecs_task_execution.name

  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}