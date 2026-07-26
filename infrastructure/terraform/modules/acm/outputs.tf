################################################################################
# Outputs
################################################################################

output "certificate_arn" {
  value = aws_acm_certificate_validation.this.certificate_arn
}

output "domain_validation_options" {
  description = "DNS validation records."
  value       = aws_acm_certificate.this.domain_validation_options
}