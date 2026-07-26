################################################################################
# Variables
################################################################################

variable "project_name" {
  description = "Project name."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "domain_name" {
  description = "Primary domain name."
  type        = string
}

variable "validation_record_fqdns" {
  description = "DNS validation record FQDNs."
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags applied to resources."
  type        = map(string)
}