######## Resources Output ########
##################################
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_app_subnet_ids" {
  value = module.vpc.private_app_subnet_ids
}

output "private_db_subnet_ids" {
  value = module.vpc.private_db_subnet_ids
}

output "alb_sg_id" {
  description = "ALB Security Group ID"
  value       = module.security_groups.alb_sg_id
}

output "ecs_sg_id" {
  description = "ECS Security Group ID"
  value       = module.security_groups.ecs_sg_id
}

output "rds_sg_id" {
  description = "RDS Security Group ID"
  value       = module.security_groups.rds_sg_id
}

################################################################################
# IAM Outputs
################################################################################

output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS Task Execution Role."

  value = module.iam.ecs_task_execution_role_arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS Task Role."

  value = module.iam.ecs_task_role_arn
}

################################################################################
# Amazon ECR Outputs
################################################################################

output "ecr_repository_names" {
  description = "Map of ECR repository names."

  value = module.ecr.repository_names
}

output "ecr_repository_urls" {
  description = "Map of ECR repository URLs."

  value = module.ecr.repository_urls
}

output "ecr_repository_arns" {
  description = "Map of ECR repository ARNs."

  value = module.ecr.repository_arns
}

################################################################################
# Amazon RDS Outputs
################################################################################

output "db_instance_identifier" {
  description = "RDS instance identifier."

  value = module.rds.db_instance_identifier
}

output "db_resource_id" {
  description = "RDS resource ID."

  value = module.rds.db_resource_id
}

output "db_endpoint" {
  description = "RDS endpoint."

  value = module.rds.db_endpoint
}

output "db_port" {
  description = "RDS port."

  value = module.rds.db_port
}

output "db_name" {
  description = "Initial database name."

  value = module.rds.db_name
}

output "master_user_secret_arn" {
  description = "Secrets Manager ARN containing the generated master credentials."

  value = module.rds.master_user_secret_arn
}
################################################################################
# ALB Outputs
################################################################################

output "alb_arn" {
  value = module.alb.alb_arn
}

output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

output "alb_zone_id" {
  value = module.alb.alb_zone_id
}

output "target_group_arns" {
  value = module.alb.target_group_arns
}

output "listener_http_arn" {
  value = module.alb.listener_http_arn
}

################################################################################
# ECS Outputs
################################################################################

output "ecs_cluster_name" {
  description = "ECS Cluster name."
  value       = module.ecs.cluster_name
}

output "ecs_cluster_arn" {
  description = "ECS Cluster ARN."
  value       = module.ecs.cluster_arn
}

output "ecs_service_name" {
  description = "ECS Service name."
  value       = module.ecs.service_name
}

output "ecs_task_definition_arn" {
  description = "Task Definition ARN."
  value       = module.ecs.task_definition_arn
}

output "ecs_log_group_names" {
  description = "CloudWatch Log Group names."
  value       = module.ecs.log_group_names
}

output "ecs_log_group_arns" {
  description = "CloudWatch Log Group ARNs."
  value       = module.ecs.log_group_arns
}

################################################################################
# S3-Static App outputs
################################################################################
output "frontend_bucket_name" {
  description = "Frontend S3 bucket name."
  value       = module.s3.bucket_name
}

output "frontend_bucket_arn" {
  description = "Frontend S3 bucket ARN."
  value       = module.s3.bucket_arn
}

output "frontend_bucket_regional_domain_name" {
  description = "Frontend S3 bucket regional domain name."
  value       = module.s3.bucket_regional_domain_name
}

################################################################################
# CloudFront Outputs
################################################################################

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID."
  value       = module.cloudfront.distribution_id
}

output "cloudfront_distribution_domain_name" {
  description = "CloudFront distribution domain name."
  value       = module.cloudfront.distribution_domain_name
}
################################################################################
# S3 Outputs
################################################################################

output "bucket_id" {
  description = "S3 bucket ID."
  value       = module.s3.bucket_id
}

################################################################################
# ACM Outputs
################################################################################

output "alb_acm_certificate_arn" {
  description = "ALB ACM certificate ARN."
  value       = module.acm_alb.certificate_arn
}

output "alb_acm_validation_records" {
  description = "ALB ACM DNS validation records."
  value       = module.acm_alb.domain_validation_options
}

output "cloudfront_acm_certificate_arn" {
  description = "CloudFront ACM certificate ARN."
  value       = module.acm_cloudfront.certificate_arn
}

output "cloudfront_acm_validation_records" {
  description = "CloudFront ACM DNS validation records."
  value       = module.acm_cloudfront.domain_validation_options
}