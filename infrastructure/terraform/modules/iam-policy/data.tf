data "aws_iam_policy_document" "secrets" {

  statement {

    effect = "Allow"

    actions = [

      "secretsmanager:GetSecretValue"

    ]

    resources = [

      var.rds_secret_arn

    ]

  }

}