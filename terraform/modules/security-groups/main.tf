resource "aws_security_group" "alb" {

  name        = "${local.name}-alb-sg"

  description = "ALB Security Group"

  vpc_id = var.vpc_id

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-alb-sg"
    }
  )

}
resource "aws_vpc_security_group_ingress_rule" "alb_http" {

  security_group_id = aws_security_group.alb.id

  cidr_ipv4 = "0.0.0.0/0"

  from_port = 80

  ip_protocol = "tcp"

  to_port = 80

}
resource "aws_vpc_security_group_ingress_rule" "alb_https" {

  security_group_id = aws_security_group.alb.id

  cidr_ipv4 = "0.0.0.0/0"

  from_port = 443

  ip_protocol = "tcp"

  to_port = 443

}
resource "aws_vpc_security_group_egress_rule" "alb" {

  security_group_id = aws_security_group.alb.id

  cidr_ipv4 = "0.0.0.0/0"

  ip_protocol = "-1"

}
resource "aws_security_group" "ecs" {

  name = "${local.name}-ecs-sg"

  description = "ECS Security Group"

  vpc_id = var.vpc_id

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-ecs-sg"
    }
  )

}
resource "aws_vpc_security_group_ingress_rule" "ecs" {

  security_group_id = aws_security_group.ecs.id

  referenced_security_group_id = aws_security_group.alb.id

  from_port = var.application_port

  to_port = var.application_port

  ip_protocol = "tcp"

}
resource "aws_vpc_security_group_egress_rule" "ecs" {

  security_group_id = aws_security_group.ecs.id

  cidr_ipv4 = "0.0.0.0/0"

  ip_protocol = "-1"

}
resource "aws_security_group" "rds" {

  name = "${local.name}-rds-sg"

  description = "RDS Security Group"

  vpc_id = var.vpc_id

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-rds-sg"
    }
  )

}
resource "aws_vpc_security_group_ingress_rule" "rds" {

  security_group_id = aws_security_group.rds.id

  referenced_security_group_id = aws_security_group.ecs.id

  from_port = 3306

  to_port = 3306

  ip_protocol = "tcp"

}
resource "aws_vpc_security_group_egress_rule" "rds" {

  security_group_id = aws_security_group.rds.id

  cidr_ipv4 = "0.0.0.0/0"

  ip_protocol = "-1"

}
