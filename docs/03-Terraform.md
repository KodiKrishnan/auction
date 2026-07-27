# 🏗️ Terraform Infrastructure

## Overview

The entire infrastructure for the Nivasabid Property Auction Platform is provisioned using **Terraform** following Infrastructure as Code (IaC) principles.

Terraform provides a consistent, repeatable, and automated way to deploy infrastructure across multiple environments while keeping the infrastructure version-controlled.

The project follows a **modular architecture**, where each AWS service is implemented as an independent Terraform module.

---

# Why Terraform?

Terraform was selected because it provides:

- Infrastructure as Code (IaC)
- Version-controlled infrastructure
- Reusable modules
- Automated deployments
- Multi-environment support
- Consistent provisioning
- Easy rollback through version control

---

# Project Structure

```
infrastructure/
│
├── environments/
│   ├── dev.tfvars
│   ├── uat.tfvars
│   └── prod.tfvars
│
├── modules/
│   ├── vpc/
│   ├── security-groups/
│   ├── iam/
│   ├── ecr/
│   ├── ecs/
│   ├── alb/
│   ├── acm/
│   ├── rds/
│   ├── s3/
│   └── cloudfront/
│
├── providers.tf
├── versions.tf
├── variables.tf
├── outputs.tf
└── main.tf
```

---

# Infrastructure Modules

Each AWS service is implemented as an independent Terraform module.

---

# VPC Module

## Purpose

Creates the networking foundation for the infrastructure.

### Resources

- Amazon VPC
- Public Subnets
- Private Application Subnets
- Private Database Subnets
- Internet Gateway
- NAT Gateway
- Route Tables
- Route Table Associations

### Outputs

- VPC ID
- Public Subnet IDs
- Private Application Subnet IDs
- Private Database Subnet IDs

---

# Security Groups Module

## Purpose

Controls inbound and outbound network traffic.

### Resources

Creates security groups for:

- Application Load Balancer
- ECS Fargate
- Amazon RDS

### Responsibilities

- Restrict network access
- Allow only required ports
- Isolate backend and database traffic

---

# IAM Module

## Purpose

Creates IAM roles and policies required by AWS services.

### Resources

- ECS Task Execution Role
- ECS Task Role
- IAM Policies
- Policy Attachments

### Responsibilities

- Pull Docker images from ECR
- Write logs to CloudWatch
- Access AWS services securely

---

# Amazon ECR Module

## Purpose

Creates a private Docker image repository.

### Resources

- Amazon Elastic Container Registry

### Responsibilities

- Store backend Docker images
- Version container images
- Support automated deployments

---

# ECS Module

## Purpose

Deploys the Spring Boot backend.

### Resources

- ECS Cluster
- ECS Service
- Task Definition
- Task Execution Role
- Container Definitions

### Responsibilities

- Run Docker containers
- Maintain desired task count
- Replace failed tasks automatically

---

# Application Load Balancer Module

## Purpose

Distributes incoming traffic across ECS tasks.

### Resources

- Application Load Balancer
- Target Group
- HTTP Listener
- HTTPS Listener

### Responsibilities

- SSL Termination
- Health Checks
- Traffic Distribution

---

# ACM Module

## Purpose

Creates SSL/TLS certificates for secure HTTPS communication.

### Resources

- AWS Certificate Manager Certificate
- Certificate Validation

### Responsibilities

- HTTPS encryption
- SSL certificate management

---

# Amazon RDS Module

## Purpose

Creates the managed MySQL database.

### Resources

- RDS MySQL Instance
- DB Subnet Group
- Parameter Group

### Responsibilities

- Persistent storage
- Automated backups
- Multi-AZ deployment
- Managed database operations

---

# Amazon S3 Module

## Purpose

Hosts the React frontend.

### Resources

- Amazon S3 Bucket

### Responsibilities

- Store static website files
- Integrate with CloudFront
- Highly durable object storage

---

# CloudFront Module

## Purpose

Delivers frontend content globally.

### Resources

- CloudFront Distribution

### Responsibilities

- Global content delivery
- HTTPS support
- Edge caching
- Improved application performance

---

# Module Dependency Flow

```
VPC
 │
 ├──────────────┐
 │              │
 ▼              ▼
Security      IAM
Groups
 │              │
 └──────┬───────┘
        ▼
      Amazon ECR
        │
        ▼
       ECS
        │
        ▼
Application Load Balancer
        │
        ▼
CloudFront
        │
        ▼
Users

RDS
 ▲
 │
 ECS
```

---

# Environment Configuration

The project supports multiple environments.

```
dev

↓

uat

↓

prod
```

Each environment uses its own `.tfvars` file.

Example:

```
dev.tfvars

uat.tfvars

prod.tfvars
```

This approach allows infrastructure values to vary while reusing the same Terraform code.

---

# Remote State Management

Terraform state is stored remotely to enable collaboration and consistent deployments.

Benefits include:

- Shared state
- Versioning
- State locking
- Secure storage
- Team collaboration

---

# Terraform Workflow

Infrastructure deployment follows this workflow.

```
terraform init

↓

terraform fmt

↓

terraform validate

↓

terraform plan

↓

terraform apply
```

---

# CI/CD Integration

Terraform is integrated with GitHub Actions.

Deployment workflow:

```
Developer

↓

Git Push

↓

GitHub Actions

↓

Terraform Init

↓

Terraform Validate

↓

Terraform Plan

↓

Terraform Apply

↓

Infrastructure Updated
```

This enables fully automated infrastructure deployments.

---

# Infrastructure Outputs

Terraform exports important values after deployment.

Examples include:

- VPC ID
- ECS Cluster Name
- ALB DNS Name
- CloudFront Domain Name
- RDS Endpoint
- ECR Repository URL
- ACM Certificate ARN

These outputs are consumed by applications and deployment pipelines.

---

# Benefits of Modular Design

The modular architecture provides several advantages.

- Code Reusability
- Easier Maintenance
- Environment Consistency
- Independent Module Development
- Simplified Testing
- Better Collaboration
- Cleaner Code Organization

---

# Best Practices Implemented

The infrastructure follows Terraform best practices.

- Modular Design
- Reusable Variables
- Separate Environment Configuration
- Infrastructure as Code
- Version Control
- Least Privilege IAM
- Remote State Management
- Consistent Resource Tagging

---

# Summary

Terraform is the foundation of the Nivasabid infrastructure. By using reusable modules, environment-specific configurations, and Infrastructure as Code principles, the platform can be deployed consistently across multiple environments while remaining scalable, maintainable, and production-ready.