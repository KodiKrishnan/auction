variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "ecs_task_role_name" {
  description = "ECS Task Role name"
  type        = string
}

variable "rds_secret_arn" {
  description = "RDS Secret ARN"
  type        = string
}