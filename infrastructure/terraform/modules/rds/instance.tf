################################################################################
# Amazon RDS MySQL Instance
################################################################################

resource "aws_db_instance" "this" {

  identifier = "${var.project_name}-${var.environment}-db"

  # Database Configuration
  engine         = "mysql"
  engine_version = var.engine_version
  db_name        = var.db_name

  # Authentication
  username                    = var.master_username
  manage_master_user_password = true

  # Compute
  instance_class = var.instance_class

  # Storage
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = var.storage_type
  storage_encrypted     = true

  # High Availability
  multi_az = var.multi_az

  # Networking
  publicly_accessible    = false
  db_subnet_group_name   = aws_db_subnet_group.this.name
  parameter_group_name   = aws_db_parameter_group.this.name
  vpc_security_group_ids = var.security_group_ids

  # Backup & Maintenance
  backup_retention_period    = var.backup_retention_days
  auto_minor_version_upgrade = true
  apply_immediately          = var.apply_immediately
  deletion_protection        = var.deletion_protection
  skip_final_snapshot        = var.skip_final_snapshot

  # Monitoring
  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports

  performance_insights_enabled = var.performance_insights_enabled

  # Resource Tags
  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-db"
    }
  )

  lifecycle {
    prevent_destroy = false
  }
}