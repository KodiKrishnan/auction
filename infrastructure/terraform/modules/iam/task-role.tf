################################################################################
# ECS Task Role
#
# Purpose:
# - IAM role assumed by the application running inside the ECS task.
#
# Note:
# This role intentionally has NO permissions in Sprint 3.
# Least-privilege permissions will be attached in future sprints:
# - Secrets Manager
# - Amazon S3
# - Amazon SES
# - Amazon EventBridge
################################################################################


################################################################################
# ECS Task Role
################################################################################

resource "aws_iam_role" "ecs_task" {

  name = "${var.project_name}-${var.environment}-ecs-task-role"

  description = "IAM role assumed by the application running inside ECS tasks."

  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json

  tags = var.tags
}