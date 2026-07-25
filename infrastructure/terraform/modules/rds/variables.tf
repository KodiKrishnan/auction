################################################################################
# Input Variables
################################################################################

variable "project_name" {
  description = "Project name used for naming RDS resources."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "db_name" {
  description = "Initial database name."
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.db_name))
    error_message = "Database name must start with a letter and contain only letters, numbers, and underscores."
  }
}

variable "master_username" {
  description = "Master username for the RDS instance."
  type        = string

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.master_username))
    error_message = "Master username must start with a letter and contain only letters, numbers, and underscores."
  }
}

variable "engine_version" {
  description = "MySQL engine version."
  type        = string
  default     = "8.4"
}

variable "instance_class" {
  description = "RDS instance class."
  type        = string
}

variable "allocated_storage" {
  description = "Allocated storage in GB."
  type        = number

  validation {
    condition     = var.allocated_storage >= 20
    error_message = "Allocated storage must be at least 20 GB."
  }
}

variable "max_allocated_storage" {
  description = "Maximum storage for autoscaling."
  type        = number
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment."
  type        = bool
}

variable "backup_retention_days" {
  description = "Number of days to retain automated backups."
  type        = number

  validation {
    condition     = var.backup_retention_days >= 0
    error_message = "Backup retention must be zero or greater."
  }
}

variable "deletion_protection" {
  description = "Enable deletion protection."
  type        = bool
}

variable "private_subnet_ids" {
  description = "Private database subnet IDs."
  type        = list(string)

  validation {
    condition     = length(var.private_subnet_ids) >= 2
    error_message = "At least two private subnets are required."
  }
}

variable "security_group_ids" {
  description = "Security groups attached to the RDS instance."
  type        = list(string)

  validation {
    condition     = length(var.security_group_ids) > 0
    error_message = "At least one security group must be specified."
  }
}

variable "tags" {
  description = "Common tags applied to all RDS resources."
  type        = map(string)
}

variable "storage_type" {
  description = "Storage type for the RDS instance."
  type        = string
  default     = "gp3"

  validation {
    condition     = contains(["gp3", "gp2", "io1"], var.storage_type)
    error_message = "Storage type must be one of gp3, gp2, or io1."
  }
}

variable "enabled_cloudwatch_logs_exports" {
  description = "Database logs exported to CloudWatch."
  type        = list(string)

  default = [
    "error",
    "slowquery"
  ]
}

variable "performance_insights_enabled" {
  description = "Enable Performance Insights."
  type        = bool
  default     = false
}

variable "apply_immediately" {
  description = "Apply database modifications immediately."
  type        = bool
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot during database deletion."
  type        = bool
}
