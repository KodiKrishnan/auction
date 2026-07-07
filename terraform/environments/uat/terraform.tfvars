aws_region = "ap-south-1"

project_name = "nivasabid"

environment = "uat"

vpc_cidr = "10.0.0.0/16"

availability_zones = [
  "ap-south-1a",
  "ap-south-1b"
]

public_subnet_cidrs = [
  "10.0.1.0/24",
  "10.0.2.0/24"
]

private_app_subnet_cidrs = [
  "10.0.11.0/24",
  "10.0.12.0/24"
]

private_db_subnet_cidrs = [
  "10.0.21.0/24",
  "10.0.22.0/24"
]

enable_nat_gateway = true

single_nat_gateway = true

tags = {

  Project = "Auction"

  Environment = "UAT"

  Owner = "DevOps"

  ManagedBy = "Terraform"

}

db_name     = "auction"
db_username = "admin"
db_port = 3306

preferred_backup_window = "18:00-19:00"

preferred_maintenance_window = "Sun:20:00-Sun:21:00"

skip_final_snapshot = true