variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "google_client_id" {
  type      = string
  sensitive = true
}

variable "tags" {
  type = map(string)
}