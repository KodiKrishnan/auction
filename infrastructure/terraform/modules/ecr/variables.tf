variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "repository_name" {
  type = string
}

variable "image_tag_mutability" {
  type    = string
  default = "IMMUTABLE"

  validation {
    condition = contains(
      ["MUTABLE", "IMMUTABLE"],
      var.image_tag_mutability
    )

    error_message = "Invalid mutability."
  }
}

variable "scan_on_push" {
  type    = bool
  default = true
}

variable "tags" {
  type    = map(string)
  default = {}
}