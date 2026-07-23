resource "aws_secretsmanager_secret" "backend" {

  name = "/${var.project_name}/${var.environment}/backend"

  description = "Backend application secrets"

  recovery_window_in_days = 0

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "backend" {

  secret_id = aws_secretsmanager_secret.backend.id

  secret_string = jsonencode({

    jwt_secret      = var.jwt_secret

    google_client_id = var.google_client_id

  })
}