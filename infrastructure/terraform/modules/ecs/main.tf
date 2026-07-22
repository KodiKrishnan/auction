resource "aws_ecs_cluster" "this" {

  name = "${local.name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-cluster"
    }
  )

}

resource "aws_ecs_cluster_capacity_providers" "this" {

  cluster_name = aws_ecs_cluster.this.name

  capacity_providers = [
    "FARGATE",
    "FARGATE_SPOT"
  ]

  default_capacity_provider_strategy {

    capacity_provider = "FARGATE"

    weight = 1

    base = 1

  }

}
resource "aws_cloudwatch_log_group" "ecs" {

  name = "/ecs/${local.name}"

  retention_in_days = 30

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-ecs-logs"
    }
  )

}