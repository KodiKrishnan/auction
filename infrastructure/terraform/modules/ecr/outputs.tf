################################################################################
# Outputs
################################################################################

output "repository_names" {
  description = "Map of ECR repository names."

  value = {
    for key, repository in aws_ecr_repository.this :
    key => repository.name
  }
}

output "repository_urls" {
  description = "Map of ECR repository URLs."

  value = {
    for key, repository in aws_ecr_repository.this :
    key => repository.repository_url
  }
}

output "repository_arns" {
  description = "Map of ECR repository ARNs."

  value = {
    for key, repository in aws_ecr_repository.this :
    key => repository.arn
  }
}