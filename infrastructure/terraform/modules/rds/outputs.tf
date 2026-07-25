################################################################################
# Outputs
################################################################################

output "db_instance_identifier" {
  description = "RDS instance identifier."

  value = aws_db_instance.this.identifier
}

output "db_resource_id" {
  description = "RDS resource ID."

  value = aws_db_instance.this.resource_id
}

output "db_endpoint" {
  description = "RDS endpoint."

  value = aws_db_instance.this.address
}

output "db_port" {
  description = "RDS port."

  value = aws_db_instance.this.port
}

output "db_name" {
  description = "Initial database name."

  value = aws_db_instance.this.db_name
}

output "master_user_secret_arn" {
  description = "Secrets Manager ARN containing the generated master credentials."

  value = aws_db_instance.this.master_user_secret[0].secret_arn
}