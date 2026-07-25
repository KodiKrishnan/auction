# Amazon ECR Module

## Purpose

Creates one private Amazon ECR repository for each application service.

---

## Resources Created

- Amazon ECR Repository
- Amazon ECR Lifecycle Policy

---

## Features

- Private repositories
- Immutable image tags
- Image scanning on push
- AES256 encryption
- Lifecycle policy (retain latest 20 images)

---

## Inputs

| Name | Type | Description |
|------|------|-------------|
| project_name | string | Project name |
| repositories | list(string) | List of repositories |
| tags | map(string) | Common resource tags |

---

## Outputs

| Name | Description |
|------|-------------|
| repository_names | Repository names |
| repository_urls | Repository URLs |
| repository_arns | Repository ARNs |

---

## Example

```hcl
module "ecr" {
  source = "./modules/ecr"

  project_name = "nivasabid"

  repositories = [
    "backend",
    "frontend"
  ]

  tags = local.common_tags
}
```