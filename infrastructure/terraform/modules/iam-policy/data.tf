data "aws_iam_policy_document" "ecs_secret_access" {

  statement {

    sid    = "ReadApplicationSecrets"

    effect = "Allow"

    actions = [
      "secretsmanager:GetSecretValue"
    ]

    resources = var.secret_arns

  }

}