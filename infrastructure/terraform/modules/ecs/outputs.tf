output "cluster_name" {
  description = "ECS Cluster Name"
  value       = aws_ecs_cluster.this.name
}

output "cluster_arn" {
  description = "ECS Cluster ARN"
  value       = aws_ecs_cluster.this.arn
}

output "log_group_name" {
  description = "CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.ecs.name
}