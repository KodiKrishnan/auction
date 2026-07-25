################################################################################
# RDS Parameter Group
################################################################################

resource "aws_db_parameter_group" "this" {

  name = "${var.project_name}-${var.environment}-mysql-parameter-group"

  family = "mysql8.4"

  description = "MySQL parameter group for ${var.project_name} (${var.environment})."

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-mysql-parameter-group"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}