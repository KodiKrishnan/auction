# ⚠️ Challenges & Solutions

## Overview

Building the Nivasabid Property Auction Platform involved solving several infrastructure, networking, deployment, and automation challenges.

This document highlights the key issues encountered during development, the root causes, the implemented solutions, and the lessons learned.

---

# Challenge 1: CloudFront SSL Certificate Region Requirement

## Problem

After creating an AWS Certificate Manager (ACM) certificate in the **ap-south-1** region and attaching it to CloudFront, the deployment failed.

Terraform returned an error similar to:

```
UnsupportedCertificate
```

CloudFront refused to use the certificate.

---

## Root Cause

Unlike most AWS services, **CloudFront only accepts ACM certificates created in the `us-east-1` region**.

The existing certificate was created in **ap-south-1**, making it valid for the Application Load Balancer but invalid for CloudFront.

---

## Solution

Created two independent ACM certificates.

### Certificate 1

- Region: ap-south-1
- Used by: Application Load Balancer

### Certificate 2

- Region: us-east-1
- Used by: CloudFront

Terraform provider aliases were used to provision certificates in different AWS regions.

---

## Lesson Learned

Some AWS services have region-specific requirements.

Always verify service-specific limitations before provisioning infrastructure.

---

# Challenge 2: ACM Certificate Validation

## Problem

Terraform waited indefinitely while creating ACM certificates.

The deployment appeared stuck during certificate creation.

---

## Root Cause

AWS ACM requires domain ownership verification before issuing certificates.

DNS validation records had not yet been created.

---

## Solution

Implemented a two-phase deployment process.

### Phase 1

- Create ACM certificates
- Obtain DNS validation records

### Phase 2

- Add CNAME records to GoDaddy
- Wait for certificate status to become **ISSUED**
- Run Terraform again

---

## Lesson Learned

Infrastructure provisioning sometimes depends on external systems.

Separating deployment into logical phases simplifies troubleshooting.

---

# Challenge 3: Managing Multiple Terraform Modules

## Problem

As infrastructure grew, maintaining all resources in a single Terraform configuration became difficult.

The codebase became harder to understand and maintain.

---

## Root Cause

All AWS resources were initially managed together, increasing complexity and coupling.

---

## Solution

Refactored the project into reusable Terraform modules.

Modules created include:

- VPC
- Security Groups
- IAM
- ACM
- ALB
- ECS
- ECR
- RDS
- S3
- CloudFront

Each module exposes well-defined variables and outputs.

---

## Lesson Learned

Modular Infrastructure as Code improves readability, reusability, and long-term maintainability.

---

# Challenge 4: Spring Boot Container Configuration

## Problem

The backend application ran successfully on the local machine but failed after being containerized.

The application could not connect to the database.

---

## Root Cause

Environment variables required by Spring Boot were not correctly passed into the Docker container.

The datasource configuration inside the container differed from the local environment.

---

## Solution

Updated the Docker configuration and ECS task definition to inject the required environment variables.

Verified connectivity using container logs and application startup messages.

---

## Lesson Learned

Applications should rely on environment variables rather than hardcoded configuration to ensure consistent deployments across environments.

---

# Challenge 5: Docker Networking

## Problem

The backend container could not establish a connection with the MySQL container during local development.

---

## Root Cause

The backend attempted to connect to `localhost`, which refers to the container itself rather than another container.

---

## Solution

Configured Docker Compose networking and used the MySQL service name as the database host.

Example:

```
spring.datasource.url=jdbc:mysql://mysql:3306/nivasabid
```

---

## Lesson Learned

Containers communicate using service names within the same Docker network, not localhost.

---

# Challenge 6: GitHub Actions Workflow Maintenance

## Problem

Frequent testing generated a large number of failed GitHub Actions workflow runs.

The Actions history became cluttered and difficult to navigate.

---

## Root Cause

GitHub retains workflow history unless manually deleted.

---

## Solution

Created a custom GitHub Actions workflow that automatically removes failed workflow runs.

Benefits:

- Cleaner Actions history
- Easier troubleshooting
- Improved repository maintenance

---

## Lesson Learned

Operational maintenance also includes keeping CI/CD pipelines clean and manageable.

---

# Challenge 7: Terraform Validation Errors

## Problem

Terraform validation failed due to duplicate resource and output definitions.

---

## Root Cause

During module refactoring, duplicate declarations remained in multiple files.

---

## Solution

Reviewed the project structure, removed duplicate definitions, and organized resources into their appropriate modules.

Validated the project using:

```
terraform fmt

terraform validate

terraform plan
```

before every deployment.

---

## Lesson Learned

Running validation commands before deployment helps detect configuration issues early.

---

# Challenge 8: ECS Rolling Deployments

## Problem

Deploying a new backend version without disrupting active users required a safe deployment strategy.

---

## Root Cause

Replacing all running tasks simultaneously could result in temporary downtime if the new version failed to start.

---

## Solution

Configured the ECS service to use rolling deployments.

New tasks are started and pass health checks before old tasks are terminated.

---

## Lesson Learned

Rolling deployments reduce service interruption and provide safer application updates.

---

# Challenge 9: Secure Secret Management

## Problem

Application configuration required sensitive values such as database credentials.

Hardcoding these values would expose sensitive information.

---

## Root Cause

Configuration values must remain outside source code for security and maintainability.

---

## Solution

Stored sensitive configuration outside the application and injected values securely during deployment.

This approach keeps credentials out of the repository and simplifies configuration changes.

---

## Lesson Learned

Secrets should never be committed to version control.

Centralized secret management improves both security and operational flexibility.

---

# Challenge 10: Designing for High Availability

## Problem

The application needed to remain available even if an Availability Zone experienced an outage.

---

## Root Cause

A single Availability Zone introduces a single point of failure.

---

## Solution

Designed the infrastructure using:

- Multiple Availability Zones
- Application Load Balancer
- ECS Fargate Service
- Amazon RDS Multi-AZ
- CloudFront

This architecture increases resilience and service availability.

---

## Lesson Learned

High availability should be considered during the design phase rather than added later.

---

# Key Takeaways

Throughout the project, the following engineering principles proved essential:

- Break large problems into smaller components.
- Automate repetitive tasks whenever possible.
- Validate infrastructure before deployment.
- Keep infrastructure modular and reusable.
- Separate application code from infrastructure code.
- Store sensitive information securely.
- Design for scalability and high availability from the beginning.
- Learn from deployment failures and document solutions.

---

# Conclusion

The challenges encountered while building the Nivasabid platform provided valuable experience in AWS, Terraform, Docker, ECS, CI/CD, and cloud architecture. Solving these issues strengthened the overall design and reinforced the importance of automation, modular infrastructure, security, and operational best practices.

Each challenge became an opportunity to improve the platform, resulting in a more reliable and production-ready solution.