variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
}

#############################################
# ECS Task Configuration
#############################################

variable "task_cpu" {
  description = "CPU units for the ECS task"
  type        = number
  default     = 512
}

variable "task_memory" {
  description = "Memory (MiB) for the ECS task"
  type        = number
  default     = 1024
}

variable "container_name" {
  description = "Container name"
  type        = string
}

variable "container_image" {
  description = "Full ECR image URI"
  type        = string
}

variable "container_port" {
  description = "Application port"
  type        = number
  default     = 8080
}

variable "aws_region" {
  description = "AWS Region"
  type        = string
}

variable "execution_role_arn" {
  description = "ECS Task Execution Role"
  type        = string
}

variable "task_role_arn" {
  description = "ECS Task Role"
  type        = string
}

variable "db_endpoint" {
  description = "RDS Endpoint"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_secret_arn" {
  description = "Secrets Manager ARN for RDS"
  type        = string
}

variable "spring_profile" {
  type    = string
  default = "uat"
}

variable "app_secret_arn" {
  type = string
}

#############################################
# ECS Service
#############################################

variable "cluster_arn" {
  description = "ECS Cluster ARN"
  type        = string
}

variable "target_group_arn" {
  description = "ALB Target Group ARN"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for ECS"
  type        = list(string)
}

variable "security_group_id" {
  description = "ECS Security Group"
  type        = string
}

variable "desired_count" {
  description = "Desired ECS task count"
  type        = number
  default     = 2
}

variable "min_capacity" {
  type    = number
  default = 2
}

variable "max_capacity" {
  type    = number
  default = 6
}

variable "cpu_target" {
  type    = number
  default = 70
}

variable "memory_target" {
  type    = number
  default = 75
}