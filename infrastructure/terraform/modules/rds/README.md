# Amazon RDS Module

## Purpose

Creates a production-ready Amazon RDS MySQL instance.

---

## Resources Created

- DB Subnet Group
- DB Parameter Group
- Amazon RDS Instance

---

## Features

- MySQL 8.4
- Private subnets only
- Storage encryption
- GP3 storage
- Storage autoscaling
- AWS-managed master password
- Automated backups
- CloudWatch log exports
- Environment-aware configuration
- Dedicated parameter group

---

## Inputs

| Name | Description |
|------|-------------|
| project_name | Project name |
| environment | Deployment environment |
| db_name | Initial database |
| master_username | Database administrator |
| engine_version | MySQL version |
| instance_class | Database instance type |
| allocated_storage | Initial storage |
| max_allocated_storage | Maximum autoscaling storage |
| storage_type | Storage type |
| multi_az | Multi-AZ deployment |
| backup_retention_days | Backup retention |
| deletion_protection | Deletion protection |
| apply_immediately | Apply modifications immediately |
| skip_final_snapshot | Skip final snapshot on deletion |
| enabled_cloudwatch_logs_exports | Database logs exported to CloudWatch |
| performance_insights_enabled | Enable Performance Insights |
| private_subnet_ids | Database subnet IDs |
| security_group_ids | Security Groups |
| tags | Resource tags |

---

## Outputs

| Name | Description |
|------|-------------|
| db_instance_identifier | RDS identifier |
| db_endpoint | Database endpoint |
| db_port | Database port |
| db_name | Initial database |
| db_resource_id | RDS resource ID |
| master_user_secret_arn | Secrets Manager ARN for generated credentials |

---

## Example

```hcl
module "rds" {
  source = "./modules/rds"

  project_name = "nivasabid"
  environment  = "uat"

  db_name         = "auctiondb"
  master_username = "admin"

  instance_class = "db.t4g.micro"

  allocated_storage     = 20
  max_allocated_storage = 100

  private_subnet_ids = module.vpc.private_db_subnet_ids

  security_group_ids = [
    module.security_groups.rds_sg_id
  ]

  tags = local.common_tags
}
```