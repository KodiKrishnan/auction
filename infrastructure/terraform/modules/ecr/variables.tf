################################################################################
# Input Variables
################################################################################

variable "project_name" {
  description = "Project name used for naming ECR repositories."
  type        = string
}

variable "repositories" {
  description = "List of ECR repositories to create."
  type        = list(string)

  validation {
    condition     = length(var.repositories) > 0
    error_message = "At least one repository must be specified."
  }
}

variable "tags" {
  description = "Common tags applied to all ECR repositories."
  type        = map(string)
}

variable "image_retention_count" {
  description = "Number of images to retain in each ECR repository."
  type        = number
  default     = 10

  validation {
    condition     = var.image_retention_count > 0
    error_message = "Image retention count must be greater than zero."
  }
}