resource "aws_iam_role" "ecs_task_execution" {

  name = "${local.name}-ecs-task-execution-role"

  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-ecs-task-execution-role"
    }
  )
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {

  role = aws_iam_role.ecs_task_execution.name

  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"

}

resource "aws_iam_role" "ecs_task" {

  name = "${local.name}-ecs-task-role"

  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-ecs-task-role"
    }
  )
}