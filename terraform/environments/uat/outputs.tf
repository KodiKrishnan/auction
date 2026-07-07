output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnets" {
  value = module.vpc.public_subnet_ids
}

output "private_app_subnets" {
  value = module.vpc.private_app_subnet_ids
}

output "private_db_subnets" {
  value = module.vpc.private_db_subnet_ids
}
output "alb_security_group_id" {
  value = module.security_groups.alb_security_group_id
}

output "ecs_security_group_id" {
  value = module.security_groups.ecs_security_group_id
}

output "rds_security_group_id" {
  value = module.security_groups.rds_security_group_id
}

output "ecs_task_execution_role_arn" {
  value = module.iam.ecs_task_execution_role_arn
}

output "ecs_task_role_arn" {
  value = module.iam.ecs_task_role_arn
}

output "ecr_repository_url" {

  value = module.ecr.repository_url

}

output "ecr_repository_name" {

  value = module.ecr.repository_name

}

output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

output "target_group_arn" {
  value = module.alb.target_group_arn
}
output "db_endpoint" {
  value = module.rds.db_endpoint
}

output "db_port" {
  value = module.rds.db_port
}

output "db_secret_arn" {
  value = module.rds.db_secret_arn
}

output "db_instance_identifier" {
  value = module.rds.db_instance_identifier
}
# output "database_secret_arn" {

#   value = module.secrets_manager.database_secret_arn

# }