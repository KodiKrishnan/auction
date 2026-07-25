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

variable "public_subnet_ids" {
  description = "Public subnet IDs."
  type        = list(string)

  validation {
    condition     = length(var.public_subnet_ids) >= 2
    error_message = "At least two public subnets are required."
  }
}

variable "security_group_ids" {
  description = "Security groups attached to the ALB."
  type        = list(string)

  validation {
    condition     = length(var.security_group_ids) > 0
    error_message = "At least one security group is required."
  }
}

variable "target_groups" {
  description = "Target groups to create."
  type        = list(string)

  default = [
    "backend"
  ]
}

variable "health_check_path" {
  description = "Health check path."
  type        = string
  default     = "/actuator/health"
}

variable "health_check_matcher" {
  description = "HTTP codes considered healthy."
  type        = string
  default     = "200"
}

variable "tags" {
  description = "Common resource tags."
  type        = map(string)
}

variable "deletion_protection" {
  description = "Enable ALB deletion protection."
  type        = bool
}

variable "access_logs_enabled" {
  type    = bool
  default = false
}

variable "access_logs_bucket" {
  type    = string
  default = null
}