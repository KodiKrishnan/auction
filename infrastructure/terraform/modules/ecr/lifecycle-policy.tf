################################################################################
# ECR Lifecycle Policy
#
# Retains the latest 10 images and expires older images.
################################################################################

resource "aws_ecr_lifecycle_policy" "this" {

  for_each = aws_ecr_repository.this

  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1

        description = "Retain only the latest 10 images"

        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.image_retention_count
        }

        action = {
          type = "expire"
        }
      }
    ]
  })
}