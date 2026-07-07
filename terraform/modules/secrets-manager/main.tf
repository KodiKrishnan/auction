# resource "aws_secretsmanager_secret" "database" {

#   name = "${local.name}/database"

#   recovery_window_in_days = 7

#   tags = merge(
#     local.common_tags,
#     {
#       Name = "${local.name}-database-secret"
#     }
#   )
# }

# resource "aws_secretsmanager_secret_version" "database" {

#   secret_id = aws_secretsmanager_secret.database.id

#   secret_string = jsonencode({

#     username = var.db_username

#     password = var.db_password

#     engine = "mysql"

#     database = var.db_name

#   })

# }

# resource "aws_secretsmanager_secret_version" "database" {

#   secret_id = aws_secretsmanager_secret.database.id

#   secret_string = jsonencode({

#     username = var.db_username

#     password = var.db_password

#     engine = "mysql"

#     database = var.db_name

#   })

# }