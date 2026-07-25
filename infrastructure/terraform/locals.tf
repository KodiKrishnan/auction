locals {

  resource_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  naming = {

    vpc            = "${local.resource_prefix}-vpc"
    alb            = "${local.resource_prefix}-alb"
    ecs_cluster    = "${local.resource_prefix}-ecs"
    ecr_repository = "${local.resource_prefix}-backend"
    rds            = "${local.resource_prefix}-mysql"

    sg_alb = "${local.resource_prefix}-alb-sg"
    sg_ecs = "${local.resource_prefix}-ecs-sg"
    sg_rds = "${local.resource_prefix}-rds-sg"

    secrets   = "${local.resource_prefix}-app"
    log_group = "/ecs/${local.resource_prefix}"
  }

  ports = {
    http    = 80
    https   = 443
    backend = 8080
    mysql   = 3306
  }

}