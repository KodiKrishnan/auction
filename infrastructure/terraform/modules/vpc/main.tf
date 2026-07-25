module "vpc" {

  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 6.0"

  name = "${var.project_name}-${var.environment}"

  cidr = var.vpc_cidr

  azs = var.availability_zones

  public_subnets   = var.public_subnet_cidrs
  private_subnets  = var.private_app_subnet_cidrs
  database_subnets = var.private_db_subnet_cidrs

  enable_nat_gateway = var.enable_nat_gateway
  single_nat_gateway = var.single_nat_gateway

  enable_dns_hostnames = true
  enable_dns_support   = true

  create_database_subnet_group = true

  tags = var.tags
}