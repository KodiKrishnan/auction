resource "aws_iam_policy" "secrets" {

  name = local.policy_name

  policy = data.aws_iam_policy_document.secrets.json

}

resource "aws_iam_role_policy_attachment" "ecs" {

  role = var.ecs_task_role_name

  policy_arn = aws_iam_policy.secrets.arn

}