################################################################################
# Application Load Balancer
################################################################################
# trivy:ignore:AWS-0053
# Internet-facing ALB is required for the public auction application.
resource "aws_lb" "this" {

  name = "${var.project_name}-${var.environment}-alb"

  internal           = false
  load_balancer_type = "application"
  drop_invalid_header_fields = true


  security_groups = var.security_group_ids
  subnets         = var.public_subnet_ids
  
  idle_timeout = 60
  dynamic "access_logs" {
    for_each = var.access_logs_enabled ? [1] : []

    content {
      enabled = true
      bucket  = var.access_logs_bucket
    }
  }
  enable_deletion_protection = var.deletion_protection

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-alb"
    }
  )
}



