################################################################################
# Amazon ECR Repositories
################################################################################

resource "aws_ecr_repository" "this" {

  for_each = toset(var.repositories)

  name = "${var.project_name}-${each.value}"

  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  force_delete = true

  tags = merge(
    var.tags,
    {
      Name    = "${var.project_name}-${each.value}"
      Service = each.value
    }
  )
}