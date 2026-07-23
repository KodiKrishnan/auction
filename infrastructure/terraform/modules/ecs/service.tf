resource "aws_ecs_service" "backend" {

  name = "${local.name}-backend"

  cluster = aws_ecs_cluster.this.id

  task_definition = aws_ecs_task_definition.backend.arn

  desired_count = var.desired_count

  launch_type = "FARGATE"

  enable_execute_command = true

  deployment_minimum_healthy_percent = 50

  deployment_maximum_percent = 200

  health_check_grace_period_seconds = 120

  network_configuration {

    assign_public_ip = false

    security_groups = [
      var.security_group_id
    ]

    subnets = var.private_subnet_ids

  }

  load_balancer {

    target_group_arn = var.target_group_arn

    container_name = local.container.name

    container_port = local.container.port

  }

  lifecycle {

    ignore_changes = [
      desired_count
    ]

  }

  depends_on = [
    aws_ecs_task_definition.backend
  ]

  tags = local.common_tags

}