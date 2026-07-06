locals {

  name = "${var.nivabid}-${var.environment}"

  common_tags = merge(
    {
      Project     = var.nivabid
      Environment = var.environment
      ManagedBy   = "Terraform"
    },
    var.tags
  )

}