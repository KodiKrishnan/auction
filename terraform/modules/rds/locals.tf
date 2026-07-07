locals {

  name = "${var.project_name}-${var.environment}"

  major_engine_version = one(regexall("^[0-9]+\\.[0-9]+", var.engine_version))

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    },
    var.tags
  )

}