output "policy_arn" {
  description = "IAM policy ARN for ECS Secrets Manager access"
  value       = aws_iam_policy.secrets.arn
}