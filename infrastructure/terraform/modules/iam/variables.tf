################################################################################
# Input Variables
################################################################################

variable "project_name" {
  description = "Project name used for naming IAM resources."
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g. uat, prod)."
  type        = string
}

variable "tags" {
  description = "Common tags applied to IAM resources."
  type        = map(string)
}

variable "db_secret_arn" {
  description = "RDS managed secret ARN."
  type        = string
}