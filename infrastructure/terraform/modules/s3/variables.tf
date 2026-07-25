variable "project_name" {
  description = "Project name."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "bucket_name" {
  description = "S3 bucket name."
  type        = string
}

################################################################################
# CloudFront Configuration
################################################################################

variable "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN allowed to access the S3 bucket."
  type        = string
}