# IAM Module

## Purpose

Creates the IAM roles required by Amazon ECS.

This module provisions:

- ECS Task Execution Role
- ECS Task Role

Application permissions are intentionally not granted in this sprint and
will be added incrementally following the principle of least privilege.

---

## Resources Created

| Resource | Purpose |
|----------|---------|
| ECS Task Execution Role | Used by the ECS agent to pull images and publish logs |
| ECS Task Role | Assumed by the application running inside ECS |

---

## Inputs

| Name | Type | Description |
|------|------|-------------|
| project_name | string | Project name used for resource naming |
| environment | string | Deployment environment |
| tags | map(string) | Common resource tags |

---

## Outputs

| Name | Description |
|------|-------------|
| ecs_task_execution_role_arn | ARN of the ECS Task Execution Role |
| ecs_task_role_arn | ARN of the ECS Task Role |

---

## Dependencies

None

---

## Future Enhancements

Customer-managed IAM policies for:

- AWS Secrets Manager
- Amazon S3
- Amazon SES
- Amazon EventBridge

These policies will be attached to the ECS Task Role only.