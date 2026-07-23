resource "aws_ecr_repository" "backend" {

  name = var.repository_name

  image_tag_mutability = var.image_tag_mutability

  force_delete = true

  image_scanning_configuration {
    scan_on_push = var.scan_on_push
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(
    local.common_tags,
    {
      Name = var.repository_name
    }
  )

}

resource "aws_ecr_lifecycle_policy" "backend" {

  repository = aws_ecr_repository.backend.name

  policy = jsonencode({

    rules = [

      {

        rulePriority = 1

        description = "Keep last 20 images"

        selection = {

          tagStatus = "any"

          countType = "imageCountMoreThan"

          countNumber = 20

        }

        action = {

          type = "expire"

        }

      }

    ]

  })

}