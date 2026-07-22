variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "private_db_subnet_ids" {
  description = "Private database subnet IDs"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "RDS Security Group"
  type        = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_port" {
  description = "Database port"
  type        = number
  default     = 3306
}

variable "engine" {
  type    = string
  default = "mysql"
}

variable "engine_version" {
  type    = string
  default = "8.4"
}

variable "instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "allocated_storage" {
  type    = number
  default = 20
}

variable "max_allocated_storage" {
  type    = number
  default = 100
}

variable "multi_az" {
  type    = bool
  default = false
}

variable "backup_retention_period" {
  type    = number
  default = 1
}

variable "deletion_protection" {
  type    = bool
  default = false
}

variable "performance_insights_enabled" {
  type    = bool
  default = false
}

variable "storage_type" {
  type    = string
  default = "gp3"
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "monitoring_role_arn" {
  description = "IAM Role ARN for RDS Enhanced Monitoring"
  type        = string
}

variable "monitoring_interval" {
  description = "Enhanced Monitoring interval"

  type    = number
  default = 60

  validation {
    condition     = contains([0, 1, 5, 10, 15, 30, 60], var.monitoring_interval)
    error_message = "Valid values are 0, 1, 5, 10, 15, 30, or 60."
  }
}

variable "preferred_backup_window" {
  description = "Preferred backup window"
  type        = string
  default     = "18:00-19:00"
}

variable "preferred_maintenance_window" {
  description = "Preferred maintenance window"
  type        = string
  default     = "Sun:20:00-Sun:21:00"
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on deletion"
  type        = bool
  default     = true
}