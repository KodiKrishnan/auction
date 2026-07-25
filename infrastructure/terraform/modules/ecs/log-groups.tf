################################################################################
# CloudWatch Log Groups
################################################################################

resource "aws_cloudwatch_log_group" "this" {

  for_each = toset(var.log_groups)

  name = "/ecs/${var.project_name}-${var.environment}-${each.value}"

  retention_in_days = var.log_retention_days

  tags = merge(
    var.tags,
    {
      Name = "/ecs/${var.project_name}-${var.environment}-${each.value}"
    }
  )
}