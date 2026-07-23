resource "aws_ecs_task_definition" "backend" {

  family = "${local.name}-backend"

  network_mode = "awsvpc"

  requires_compatibilities = [
    "FARGATE"
  ]

  cpu    = var.task_cpu
  memory = var.task_memory

  execution_role_arn = var.execution_role_arn
  task_role_arn      = var.task_role_arn

  runtime_platform {

    operating_system_family = "LINUX"

    cpu_architecture = "X86_64"

  }

  container_definitions = jsonencode([

    {

      name = local.container.name

      image = local.container.image

      essential = true

      portMappings = [

        {

          containerPort = local.container.port

          hostPort = local.container.port

          protocol = "tcp"

        }

      ]

      environment = [
        {
          name  = "SPRING_PROFILES_ACTIVE"
          value = var.spring_profile
        },
        {
          name  = "SPRING_DATASOURCE_URL"
          value = "jdbc:mysql://${var.db_endpoint}:3306/${var.db_name}"
        }
      ]

      secrets = [
        {
          name      = "SPRING_DATASOURCE_USERNAME"
          valueFrom = "${var.db_secret_arn}:username::"
        },
        {
          name      = "SPRING_DATASOURCE_PASSWORD"
          valueFrom = "${var.db_secret_arn}:password::"
        },
        {
          name      = "JWT_SECRET"
          valueFrom = "${var.app_secret_arn}:jwt_secret::"
        },
        {
          name      = "GOOGLE_CLIENT_ID"
          valueFrom = "${var.app_secret_arn}:google_client_id::"
        }
      ]
      logConfiguration = {

        logDriver = "awslogs"

        options = {

          awslogs-group = aws_cloudwatch_log_group.ecs.name

          awslogs-region = var.aws_region

          awslogs-stream-prefix = "backend"

        }

      }

    }

  ])

  tags = local.common_tags

}
