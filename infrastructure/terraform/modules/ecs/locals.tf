locals {

  name = "${var.project_name}-${var.environment}"

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    },
    var.tags
  )

  container = {
    name  = var.container_name
    image = var.container_image
    port  = var.container_port
  }

}