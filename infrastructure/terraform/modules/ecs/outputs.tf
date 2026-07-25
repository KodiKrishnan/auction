################################################################################
# Outputs
################################################################################

output "cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.this.name
}

output "cluster_arn" {
  description = "ECS cluster ARN."
  value       = aws_ecs_cluster.this.arn
}

output "task_definition_arn" {
  description = "Backend task definition ARN."
  value       = aws_ecs_task_definition.backend.arn
}

output "service_name" {
  description = "Backend ECS service name."
  value       = aws_ecs_service.backend.name
}

output "log_group_names" {
  description = "CloudWatch log group names."

  value = {
    for key, log_group in aws_cloudwatch_log_group.this :
    key => log_group.name
  }
}

output "log_group_arns" {
  description = "CloudWatch log group ARNs."

  value = {
    for key, log_group in aws_cloudwatch_log_group.this :
    key => log_group.arn
  }
}