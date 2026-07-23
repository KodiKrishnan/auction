variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "ecs_task_execution_role_name" {
  type = string
}

variable "secret_arns" {
  description = "Secrets Manager ARNs accessible by ECS Task Role"
  type        = list(string)
}