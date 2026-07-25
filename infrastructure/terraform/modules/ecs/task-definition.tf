################################################################################
# ECS Task Definition
################################################################################

resource "aws_ecs_task_definition" "backend" {

  family = "${var.project_name}-${var.environment}-backend"

  network_mode = "awsvpc"

  requires_compatibilities = ["FARGATE"]

  cpu    = var.cpu
  memory = var.memory

  execution_role_arn = var.execution_role_arn
  task_role_arn      = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = var.container_name
      image     = var.container_image
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        for key, value in var.container_environment :
        {
          name  = key
          value = value
        }
      ]

      secrets = [
        for key, value in var.container_secrets :
        {
          name      = key
          valueFrom = value
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = aws_cloudwatch_log_group.this["backend"].name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  runtime_platform {
    cpu_architecture        = "X86_64"
    operating_system_family = "LINUX"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-backend-task"
    }
  )
}