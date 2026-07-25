################################################################################
# Target Groups
################################################################################

resource "aws_lb_target_group" "this" {

  for_each = toset(var.target_groups)

  name = substr("${var.project_name}-${var.environment}-${each.value}", 0, 32)

  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"

  vpc_id = var.vpc_id

  health_check {

    enabled = true

    protocol = "HTTP"

    path = var.health_check_path

    matcher = var.health_check_matcher

    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${each.value}"
    }
  )
}