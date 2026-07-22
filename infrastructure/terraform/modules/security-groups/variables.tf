variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "application_port" {
  type    = number
  default = 8080
}

variable "tags" {
  type    = map(string)
  default = {}
}