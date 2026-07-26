aws_region   = "ap-south-1"
project_name = "nivasabid"
environment  = "uat"

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

db_name            = "auctiondb"
db_master_username = "admin"

enable_nat_gateway = true
single_nat_gateway = true

container_image_tag = "uat-v1.0.0"

domain_name = "uat-nivasabid.theshortlistd.org"