resource "aws_db_subnet_group" "this" {

  name = "${local.name}-db-subnet-group"

  subnet_ids = var.private_db_subnet_ids

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-db-subnet-group"
    }
  )
}
resource "aws_db_parameter_group" "this" {

  name   = "${local.name}-mysql-parameter-group"

  family = "mysql${local.major_engine_version}"

  description = "Parameter group for ${local.name}"

  tags = local.common_tags
}
resource "aws_db_option_group" "this" {

  name = "${local.name}-mysql-option-group"

  engine_name = "mysql"

  major_engine_version = local.major_engine_version

  tags = local.common_tags
}


resource "aws_db_instance" "this" {

  identifier = "${local.name}-mysql"

  engine = var.engine

  engine_version = var.engine_version
  port = var.db_port
  instance_class = var.instance_class

  allocated_storage = var.allocated_storage

  max_allocated_storage = var.max_allocated_storage

  storage_type = var.storage_type

  storage_encrypted = true

  db_name = var.db_name

  username = var.db_username

  manage_master_user_password = true

  publicly_accessible = false

  multi_az = var.multi_az

  deletion_protection = var.deletion_protection

  backup_retention_period = var.backup_retention_period

  db_subnet_group_name = aws_db_subnet_group.this.name
  backup_window      = var.preferred_backup_window
  maintenance_window = var.preferred_maintenance_window

  vpc_security_group_ids = [
    var.rds_security_group_id
  ]

  parameter_group_name = aws_db_parameter_group.this.name

  option_group_name = aws_db_option_group.this.name

  monitoring_interval = var.monitoring_interval

  monitoring_role_arn = var.monitoring_role_arn

  performance_insights_enabled = var.performance_insights_enabled

  enabled_cloudwatch_logs_exports = [
    "error",
    "general",
    "slowquery"
  ]
  
  skip_final_snapshot          = var.skip_final_snapshot

  apply_immediately = true

  auto_minor_version_upgrade = true

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-mysql"
    }
  )
}