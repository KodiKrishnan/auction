############################################
# ALB Security Group
############################################

resource "aws_security_group" "alb" {

  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "ALB Security Group"
  vpc_id      = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  })
}

resource "aws_vpc_security_group_ingress_rule" "alb_http" {

  security_group_id = aws_security_group.alb.id

  ip_protocol = "tcp"

  from_port = 80
  to_port   = 80

  cidr_ipv4 = "0.0.0.0/0"

  description = "HTTP"
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {

  security_group_id = aws_security_group.alb.id

  ip_protocol = "tcp"

  from_port = 443
  to_port   = 443

  cidr_ipv4 = "0.0.0.0/0"

  description = "HTTPS"
}

resource "aws_vpc_security_group_egress_rule" "alb_to_ecs" {

  security_group_id = aws_security_group.alb.id

  ip_protocol = "tcp"

  from_port = var.backend_port
  to_port   = var.backend_port

  referenced_security_group_id = aws_security_group.ecs.id

  description = "ALB to ECS"
}

############################################
# ECS Security Group
############################################

resource "aws_security_group" "ecs" {

  name        = "${var.project_name}-${var.environment}-ecs-sg"
  description = "ECS Security Group"

  vpc_id = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-ecs-sg"
  })
}

resource "aws_vpc_security_group_ingress_rule" "ecs_from_alb" {

  security_group_id = aws_security_group.ecs.id

  ip_protocol = "tcp"

  from_port = var.backend_port
  to_port   = var.backend_port

  referenced_security_group_id = aws_security_group.alb.id

  description = "ALB to ECS"
}

resource "aws_vpc_security_group_egress_rule" "ecs_all_outbound" {

  security_group_id = aws_security_group.ecs.id

  ip_protocol = "-1"

  cidr_ipv4 = "0.0.0.0/0"

  description = "Allow all outbound traffic"
}

############################################
# RDS Security Group
############################################

resource "aws_security_group" "rds" {

  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "RDS Security Group"

  vpc_id = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  })
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_ecs" {

  security_group_id = aws_security_group.rds.id

  ip_protocol = "tcp"

  from_port = var.db_port
  to_port   = var.db_port

  referenced_security_group_id = aws_security_group.ecs.id

  description = "MySQL"
}