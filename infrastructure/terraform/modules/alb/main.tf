resource "aws_lb" "this" {

  name = "${local.name}-alb"

  load_balancer_type = "application"

  internal = var.internal

  security_groups = [
    var.security_group_id
  ]

  subnets = var.public_subnet_ids

  enable_deletion_protection = var.enable_deletion_protection

  idle_timeout = var.idle_timeout

  enable_cross_zone_load_balancing = true

  drop_invalid_header_fields = true

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-alb"
    }
  )

}

resource "aws_lb_target_group" "backend" {

  name = "${local.name}-tg"

  port = var.target_port

  protocol = "HTTP"

  vpc_id = var.vpc_id

  target_type = "ip"

  health_check {

    enabled = true

    path = var.health_check_path

    protocol = "HTTP"

    matcher = "200"

    interval = 30

    timeout = 5

    healthy_threshold = 2

    unhealthy_threshold = 3

  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-tg"
    }
  )

}

resource "aws_lb_listener" "http" {

  load_balancer_arn = aws_lb.this.arn

  port = 80

  protocol = "HTTP"

  default_action {

    type = "forward"

    target_group_arn = aws_lb_target_group.backend.arn

  }

}