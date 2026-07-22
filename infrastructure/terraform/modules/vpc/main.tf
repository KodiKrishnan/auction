resource "aws_vpc" "this" {

  cidr_block = var.vpc_cidr

  enable_dns_support   = var.enable_dns_support
  enable_dns_hostnames = var.enable_dns_hostnames

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-vpc"
    }
  )

}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-igw"
    }
  )

}

resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)

  vpc_id            = aws_vpc.this.id
  cidr_block        = var.public_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(
    local.common_tags,
    {
      Name                     = "${local.name}-public-${count.index + 1}"
      Tier                     = "public"
      "kubernetes.io/role/elb" = "1"
    }
  )

}

resource "aws_subnet" "private_app" {
  count = length(var.private_app_subnet_cidrs)

  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_app_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(
    local.common_tags,
    {
      Name                              = "${local.name}-private-app-${count.index + 1}"
      Tier                              = "application"
      "kubernetes.io/role/internal-elb" = "1"
    }
  )

}

resource "aws_subnet" "private_db" {
  count = length(var.private_db_subnet_cidrs)

  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_db_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-private-db-${count.index + 1}"
    }
  )

}

resource "aws_eip" "nat" {

  count = var.enable_nat_gateway ? 1 : 0

  domain = "vpc"

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-nat-eip"
    }
  )

}

resource "aws_nat_gateway" "this" {

  count = var.enable_nat_gateway ? 1 : 0

  allocation_id = aws_eip.nat[0].id

  subnet_id = aws_subnet.public[0].id

  depends_on = [
    aws_internet_gateway.this
  ]

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-nat"
    }
  )

}

resource "aws_route_table" "public" {

  vpc_id = aws_vpc.this.id

  route {

    cidr_block = "0.0.0.0/0"

    gateway_id = aws_internet_gateway.this.id

  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-public-rt"
    }
  )

}

resource "aws_route_table_association" "public" {

  count = length(aws_subnet.public)

  subnet_id = aws_subnet.public[count.index].id

  route_table_id = aws_route_table.public.id

}

resource "aws_route_table" "private_app" {

  vpc_id = aws_vpc.this.id

  dynamic "route" {

    for_each = var.enable_nat_gateway ? [1] : []

    content {

      cidr_block = "0.0.0.0/0"

      nat_gateway_id = aws_nat_gateway.this[0].id

    }

  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-private-app-rt"
    }
  )

}

resource "aws_route_table_association" "private_app" {

  count = length(aws_subnet.private_app)

  subnet_id = aws_subnet.private_app[count.index].id

  route_table_id = aws_route_table.private_app.id

}

resource "aws_route_table" "private_db" {

  vpc_id = aws_vpc.this.id

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-private-db-rt"
    }
  )

}

resource "aws_route_table_association" "private_db" {

  count = length(aws_subnet.private_db)

  subnet_id = aws_subnet.private_db[count.index].id

  route_table_id = aws_route_table.private_db.id

}

#explain this main.tf This `main.tf` file is part of a Terraform module that defines an AWS Virtual Private Cloud (VPC) resource. Here's a breakdown of the key components:
# 1. **Resource Block**: The `resource "aws_vpc" "this"` block defines an AWS VPC resource. The name "this" is a local identifier for this specific resource within the module.
# 2. **CIDR Block**: The `cidr_block` argument specifies the IP address range for the VPC. It uses the value from the `var.vpc_cidr` variable, which is expected to be provided when the module is called.
# 3. **DNS Support and Hostnames**: The `enable_dns_support` and `enable_dns_hostnames` arguments control whether DNS support and DNS hostnames are enabled for the VPC. These values are also sourced from variables (`var.enable_dns_support` and `var.enable_dns_hostnames`).
# 4. **Tags**: The `tags` argument allows you to assign metadata to the VPC resource. It merges a set of common tags defined in `local.common_tags` with a specific name tag for the VPC, which is constructed using the `local.name` variable and appending "-vpc" to it.
# Overall, this `main.tf` file is responsible for creating a VPC in AWS with specified configurations, including its CIDR block, DNS settings, and tags. The actual values for these configurations are expected to be provided through variables when the module is used, allowing for flexibility and reuse of the module in different environments or projects.