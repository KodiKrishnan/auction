module "vpc" {

  source = "../../modules/vpc"

  project_name = var.project_name

  environment = var.environment

  vpc_cidr = var.vpc_cidr

  availability_zones = var.availability_zones

  public_subnet_cidrs = var.public_subnet_cidrs

  private_app_subnet_cidrs = var.private_app_subnet_cidrs

  private_db_subnet_cidrs = var.private_db_subnet_cidrs

  enable_nat_gateway = var.enable_nat_gateway

  single_nat_gateway = var.single_nat_gateway

  tags = var.tags
}

module "security_groups" {

  source = "../../modules/security-groups"

  project_name = var.project_name

  environment = var.environment

  vpc_id = module.vpc.vpc_id

  application_port = 8080

  tags = var.tags

}
module "iam" {

  source = "../../modules/iam"

  project_name = var.project_name

  environment = var.environment

  tags = var.tags

}

module "iam_policy" {

  source = "../../modules/iam-policy"

  project_name = var.project_name
  environment  = var.environment

  ecs_task_execution_role_name = module.iam.ecs_task_execution_role_name

  secret_arns = [
    module.rds.db_secret_arn,
    module.app_secrets.secret_arn
  ]

}

module "ecr" {

  source = "../../modules/ecr"

  project_name = var.project_name

  environment = var.environment

  repository_name = "${var.project_name}-backend"

  tags = var.tags

}

module "alb" {

  source = "../../modules/alb"

  project_name = var.project_name

  environment = var.environment

  vpc_id = module.vpc.vpc_id

  public_subnet_ids = module.vpc.public_subnet_ids

  security_group_id = module.security_groups.alb_security_group_id

  target_port = 8080

  health_check_path = "/actuator/health"

  tags = var.tags

}

module "rds" {
  source = "../../modules/rds"

  project_name = var.project_name
  environment  = var.environment

  private_db_subnet_ids = module.vpc.private_db_subnet_ids
  rds_security_group_id = module.security_groups.rds_security_group_id
  monitoring_role_arn   = module.iam.rds_monitoring_role_arn

  db_name     = var.db_name
  db_username = var.db_username
  db_port     = var.db_port

  preferred_backup_window      = var.preferred_backup_window
  preferred_maintenance_window = var.preferred_maintenance_window
  skip_final_snapshot          = var.skip_final_snapshot

  tags = var.tags
}

module "app_secrets" {

  source = "../../modules/app-secrets"

  project_name = var.project_name
  environment  = var.environment

  jwt_secret      = var.jwt_secret
  google_client_id = var.google_client_id

  tags = var.tags
}

module "ecs" {

  source = "../../modules/ecs"

  project_name = var.project_name
  environment  = var.environment
  tags         = var.tags

  task_cpu    = 512
  task_memory = 1024

  desired_count = 2

  container_name  = "${var.project_name}-backend"
  container_image = "${module.ecr.repository_url}:uat-v1.0.0"
  container_port  = 8080

  aws_region = var.aws_region

  execution_role_arn = module.iam.ecs_task_execution_role_arn
  task_role_arn      = module.iam.ecs_task_role_arn

  db_endpoint   = module.rds.db_endpoint
  db_name       = module.rds.db_name
  db_secret_arn = module.rds.db_secret_arn

  app_secret_arn = module.app_secrets.secret_arn

  spring_profile = var.environment

  cluster_arn = module.ecs.cluster_arn

  target_group_arn = module.alb.target_group_arn

  private_subnet_ids = module.vpc.private_app_subnet_ids

  security_group_id = module.security_groups.ecs_security_group_id

}