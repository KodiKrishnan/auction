module "vpc" {

  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment

  vpc_cidr = var.vpc_cidr

  availability_zones = var.availability_zones

  public_subnet_cidrs      = var.public_subnet_cidrs
  private_app_subnet_cidrs = var.private_app_subnet_cidrs
  private_db_subnet_cidrs  = var.private_db_subnet_cidrs

  enable_nat_gateway = var.enable_nat_gateway
  single_nat_gateway = var.single_nat_gateway

  tags = local.common_tags
}

module "security_groups" {

  source = "./modules/security-groups"

  project_name = var.project_name
  environment  = var.environment

  vpc_id = module.vpc.vpc_id

  backend_port = var.backend_port
  db_port      = var.db_port

  tags = local.common_tags
}

################################################################################
# IAM
################################################################################

module "iam" {
  source = "./modules/iam"

  project_name  = var.project_name
  environment   = var.environment
  tags          = local.common_tags
  db_secret_arn = module.rds.master_user_secret_arn

}

################################################################################
# Amazon ECR
################################################################################

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name

  repositories = [
    "backend",
    "frontend"
  ]

  tags = local.common_tags
}

################################################################################
# Amazon RDS
################################################################################

module "rds" {
  source = "./modules/rds"

  project_name = var.project_name
  environment  = var.environment

  db_name         = var.db_name
  master_username = var.db_master_username

  engine_version = "8.4"
  instance_class = "db.t4g.micro"

  allocated_storage     = 20
  max_allocated_storage = 100

  storage_type = "gp3"

  multi_az = false

  backup_retention_days = 7

  deletion_protection = false

  apply_immediately = true

  skip_final_snapshot = true

  performance_insights_enabled = false

  enabled_cloudwatch_logs_exports = [
    "error",
    "slowquery"
  ]

  private_subnet_ids = module.vpc.private_db_subnet_ids

  security_group_ids = [
    module.security_groups.rds_sg_id
  ]

  tags = local.common_tags
}

################################################################################
# Application Load Balancer
################################################################################

module "alb" {
  source = "./modules/alb"

  project_name = var.project_name
  environment  = var.environment

  vpc_id = module.vpc.vpc_id

  public_subnet_ids = module.vpc.public_subnet_ids

  security_group_ids = [
    module.security_groups.alb_sg_id
  ]

  target_groups = [
    "backend"
  ]

  health_check_path   = "/actuator/health"
  acm_certificate_arn = module.acm_alb.certificate_arn

  deletion_protection = false
  access_logs_enabled = false
  access_logs_bucket  = null

  tags = local.common_tags
}

################################################################################
# Amazon ECS
################################################################################

module "ecs" {
  source = "./modules/ecs"

  project_name = var.project_name
  environment  = var.environment

  aws_region = var.aws_region

  vpc_id = module.vpc.vpc_id

  private_subnet_ids = module.vpc.private_app_subnet_ids

  ecs_security_group_ids = [
    module.security_groups.ecs_sg_id
  ]

  execution_role_arn = module.iam.ecs_task_execution_role_arn
  task_role_arn      = module.iam.ecs_task_role_arn

  target_group_arn = module.alb.target_group_arns["backend"]

  container_name  = "backend"
  container_port  = 8080
  container_image = "${module.ecr.repository_urls["backend"]}:${var.container_image_tag}"

  cpu    = 512
  memory = 1024

  desired_count = 2

  log_groups = [
    "backend"
  ]

  log_retention_days = 1

  container_environment = {
    SPRING_PROFILES_ACTIVE = "uat"

    SPRING_DATASOURCE_URL = "jdbc:mysql://${module.rds.db_endpoint}:3306/${module.rds.db_name}"

    GOOGLE_CLIENT_ID = var.google_client_id

    JWT_SECRET = var.jwt_secret
  }

  container_secrets = {
    SPRING_DATASOURCE_USERNAME = "${module.rds.master_user_secret_arn}:username::"
    SPRING_DATASOURCE_PASSWORD = "${module.rds.master_user_secret_arn}:password::"
  }
  tags = local.common_tags
}

################################################################################
# Amazon S3
################################################################################
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment

  bucket_name                 = "${var.project_name}-frontend-${var.environment}"
  cloudfront_distribution_arn = module.cloudfront.distribution_arn
}

################################################################################
# CloudFront
################################################################################

module "cloudfront" {

  source = "./modules/cloudfront"
  providers = {
    aws = aws.us_east_1
  }

  project_name = var.project_name
  environment  = var.environment

  s3_bucket_name          = module.s3.bucket_name
  s3_regional_domain_name = module.s3.bucket_regional_domain_name

  alb_dns_name = module.alb.alb_dns_name

  acm_certificate_arn = module.acm_cloudfront.certificate_arn
  domain_name         = var.domain_name
}

################################################################################
# ACM
################################################################################

module "acm_alb" {

  source = "./modules/acm"

  project_name = var.project_name
  environment  = var.environment

  domain_name             = var.domain_name
  validation_record_fqdns = var.alb_validation_record_fqdns
  tags                    = local.common_tags
}

module "acm_cloudfront" {

  source = "./modules/acm"

  providers = {
    aws = aws.us_east_1
  }

  project_name = var.project_name
  environment  = var.environment

  domain_name             = var.domain_name
  validation_record_fqdns = var.cloudfront_validation_record_fqdns
  tags                    = local.common_tags
}