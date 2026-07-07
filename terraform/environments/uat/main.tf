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
# module "secrets_manager" {

#   source = "../../modules/secrets-manager"

#   project_name = var.project_name

#   environment = var.environment

#   db_username = var.db_username

#   db_password = var.db_password

#   db_name = var.db_name

#   tags = var.tags

# }