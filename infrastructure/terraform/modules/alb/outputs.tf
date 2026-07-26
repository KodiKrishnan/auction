################################################################################
# Outputs
################################################################################

output "alb_arn" {
  description = "Application Load Balancer ARN."
  value       = aws_lb.this.arn
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name."
  value       = aws_lb.this.dns_name
}

output "alb_zone_id" {
  description = "Application Load Balancer hosted zone ID."
  value       = aws_lb.this.zone_id
}

output "target_group_arns" {
  description = "Target Group ARNs."

  value = {
    for key, tg in aws_lb_target_group.this :
    key => tg.arn
  }
}

output "listener_http_arn" {
  description = "HTTP Listener ARN."
  value       = aws_lb_listener.http_redirect.arn
}