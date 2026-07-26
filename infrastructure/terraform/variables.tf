variable "aws_region" {
  description = "AWS Region"
  type        = string
}

variable "project_name" {
  description = "Project Name"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string

  validation {
    condition     = contains(["dev", "uat", "prod"], var.environment)
    error_message = "Environment must be one of: dev, uat, prod."
  }
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

variable "backend_port" {
  type    = number
  default = 8080
}

variable "db_port" {
  type    = number
  default = 3306
}


variable "container_image_tag" {
  description = "Backend container image tag."
  type        = string
  default     = "latest"
}

variable "google_client_id" {
  description = "Google OAuth client ID."
  type        = string
}

variable "jwt_secret" {
  description = "JWT secret."
  type        = string
}

################################################################################
# Database Configuration
################################################################################

variable "db_name" {
  description = "Application database name."
  type        = string
}
variable "db_master_username" {
  description = "Master username for the RDS instance."
  type        = string
}

################################################################################
# Domain Configuration
################################################################################

variable "domain_name" {
  description = "Custom domain for CloudFront."
  type        = string
}

variable "alb_validation_record_fqdns" {
  description = "DNS validation record FQDNs for the ALB ACM certificate."
  type        = list(string)
  default     = []
}

variable "cloudfront_validation_record_fqdns" {
  description = "DNS validation record FQDNs for the CloudFront ACM certificate."
  type        = list(string)
  default     = []
}