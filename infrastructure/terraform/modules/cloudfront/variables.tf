variable "project_name" {
  description = "Project name."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "s3_bucket_name" {
  description = "Frontend S3 bucket name."
  type        = string
}

variable "s3_regional_domain_name" {
  description = "Regional domain name of the S3 bucket."
  type        = string
}

variable "alb_dns_name" {
  description = "DNS name of the Application Load Balancer."
  type        = string
}

################################################################################
# ACM Configuration
################################################################################

variable "acm_certificate_arn" {
  description = "ACM certificate ARN."
  type        = string
}

variable "domain_name" {
  description = "Custom domain name."
  type        = string
}