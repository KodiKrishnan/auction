################################################################################
# Input Variables
################################################################################

variable "project_name" {
  description = "Project name."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "vpc_id" {
  description = "VPC ID."
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for ECS tasks."
  type        = list(string)

  validation {
    condition     = length(var.private_subnet_ids) >= 2
    error_message = "At least two private subnets are required."
  }
}

variable "ecs_security_group_ids" {
  description = "Security groups attached to ECS tasks."
  type        = list(string)
}

variable "execution_role_arn" {
  description = "ECS task execution role ARN."
  type        = string
}

variable "task_role_arn" {
  description = "ECS task role ARN."
  type        = string
}

variable "target_group_arn" {
  description = "Target group ARN."
  type        = string
}

variable "container_image" {
  description = "Container image URI."
  type        = string
}

variable "container_port" {
  description = "Application container port."
  type        = number
  default     = 8080
}

variable "cpu" {
  description = "Task CPU."
  type        = number
  default     = 512
}

variable "memory" {
  description = "Task memory."
  type        = number
  default     = 1024
}

variable "desired_count" {
  description = "Desired ECS task count."
  type        = number
  default     = 1
}

variable "container_name" {
  description = "Container name."
  type        = string
  default     = "backend"
}

variable "container_environment" {
  description = "Container environment variables."
  type        = map(string)
  default     = {}
}

variable "container_secrets" {
  description = "Container secrets mapped to Secrets Manager ARNs."
  type        = map(string)
  default     = {}
}

variable "aws_region" {
  description = "AWS region."
  type        = string
}

variable "tags" {
  description = "Common resource tags."
  type        = map(string)
}
variable "log_groups" {
  description = "CloudWatch log groups."
  type        = list(string)

  default = [
    "backend"
  ]
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days."
  type        = number
  default     = 30
}