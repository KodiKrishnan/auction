##############################################
# TFLint Configuration
##############################################

config {
  module = true
  force  = false
  disabled_by_default = false
}

##############################################
# Terraform Rules
##############################################

plugin "terraform" {
  enabled = true
  preset  = "recommended"
}

##############################################
# AWS Rules
##############################################

plugin "aws" {
  enabled = true
  version = "0.39.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

##############################################
# Rule Configuration
##############################################

rule "terraform_unused_declarations" {
  enabled = true
}

rule "terraform_unused_required_providers" {
  enabled = true
}

rule "terraform_deprecated_interpolation" {
  enabled = true
}

rule "terraform_required_version" {
  enabled = true
}

rule "terraform_required_providers" {
  enabled = true
}

##############################################
# AWS Best Practices
##############################################

rule "aws_instance_invalid_type" {
  enabled = true
}

rule "aws_instance_previous_type" {
  enabled = true
}

rule "aws_security_group_invalid_rule" {
  enabled = true
}

rule "aws_db_instance_invalid_type" {
  enabled = true
}

rule "aws_iam_policy_invalid_action" {
  enabled = true
}

rule "aws_iam_policy_document_gov_friendly_arns" {
  enabled = false
}

##############################################
# Ignore Generated Files
##############################################

ignore_module = {
  "terraform-aws-modules/*" = true
}