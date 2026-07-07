variable "aws_region" {
  description = "AWS Region"
  type        = string
}

variable "project_name" {
  description = "Project Name"
  type        = string
}

variable "environment" {
  description = "Environment Name"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
}

variable "availability_zones" {
  description = "Availability Zones"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  type = list(string)
}

variable "private_app_subnet_cidrs" {
  type = list(string)
}

variable "private_db_subnet_cidrs" {
  type = list(string)
}

variable "enable_nat_gateway" {
  type = bool
}

variable "single_nat_gateway" {
  type = bool
}

variable "tags" {
  type = map(string)
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_port" {
  type = number
}

variable "preferred_backup_window" {
  type = string
}

variable "preferred_maintenance_window" {
  type = string
}

variable "skip_final_snapshot" {
  type = bool
}

# variable "db_username" {
#   type      = string
#   sensitive = true
# }

# variable "db_password" {
#   type      = string
#   sensitive = true
# }

# variable "db_name" {
#   type = string
# }