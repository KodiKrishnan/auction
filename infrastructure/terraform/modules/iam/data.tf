data "aws_iam_policy_document" "ecs_assume_role" {

  statement {

    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }

    actions = [
      "sts:AssumeRole"
    ]
  }
}

data "aws_iam_policy_document" "rds_monitoring_assume_role" {

  statement {

    effect = "Allow"

    actions = [
      "sts:AssumeRole"
    ]

    principals {
      type = "Service"

      identifiers = [
        "monitoring.rds.amazonaws.com"
      ]
    }

  }

}