# 🚀 CI/CD Pipeline

## Overview

The Nivasabid project uses **GitHub Actions** to automate the build, deployment, and infrastructure provisioning processes.

Separate CI/CD pipelines are implemented for:

- Backend (Spring Boot)
- Frontend (React)

This separation allows both applications to be developed, tested, and deployed independently.

---

# CI/CD Objectives

The pipeline is designed to provide:

- Automated Build
- Continuous Integration
- Continuous Deployment
- Infrastructure Automation
- Faster Releases
- Consistent Deployments
- Reduced Manual Effort

---

# CI/CD Architecture

<p align="center">
    <img src="./images/cicd-overview.png" width="100%">
</p>

---

# Backend Deployment Pipeline

The backend pipeline automates the deployment of the Spring Boot application running on Amazon ECS Fargate.

## Workflow

```
Developer

↓

Git Push

↓

GitHub Actions

↓

Checkout Source Code

↓

Configure AWS Credentials

↓

Build Spring Boot (Maven)

↓

Run Unit Tests

↓

Build Docker Image

↓

Login to Amazon ECR

↓

Push Docker Image

↓

Terraform Init

↓

Terraform Validate

↓

Terraform Plan

↓

Terraform Apply

↓

Update ECS Service

↓

Application Deployment Complete
```

---

## Pipeline Stages

### 1. Checkout Repository

Downloads the latest application source code.

---

### 2. Configure AWS Credentials

Authenticates GitHub Actions with AWS using IAM credentials stored as GitHub Secrets.

---

### 3. Build Application

The backend application is compiled using Maven.

```
mvn clean package
```

Produces:

```
application.jar
```

---

### 4. Build Docker Image

A Docker image is created using the production Dockerfile.

```
docker build
```

---

### 5. Push Image to Amazon ECR

The newly built Docker image is pushed to Amazon Elastic Container Registry (ECR).

Example:

```
123456789012.dkr.ecr.ap-south-1.amazonaws.com/backend:latest
```

---

### 6. Terraform Deployment

Terraform provisions or updates AWS infrastructure.

Workflow:

```
terraform init

↓

terraform validate

↓

terraform plan

↓

terraform apply
```

Resources updated may include:

- ECS Task Definition
- ECS Service
- Load Balancer Configuration
- IAM Resources
- Security Groups

---

### 7. ECS Deployment

Amazon ECS launches a new task using the latest Docker image.

Deployment includes:

- Rolling update
- Health checks
- Replacement of unhealthy tasks

---

# Backend Pipeline Diagram

```
Developer

↓

GitHub

↓

GitHub Actions

↓

Build Spring Boot

↓

Docker Build

↓

Amazon ECR

↓

Terraform

↓

Amazon ECS

↓

Application Load Balancer
```

---

# Frontend Deployment Pipeline

The frontend pipeline deploys the React application to Amazon S3.

CloudFront distributes the updated content globally.

---

## Workflow

```
Developer

↓

Git Push

↓

GitHub Actions

↓

Install Dependencies

↓

Build React Application

↓

Upload Build to Amazon S3

↓

CloudFront Cache Invalidation

↓

Deployment Complete
```

---

## Pipeline Stages

### 1. Checkout Repository

Downloads the latest frontend source code.

---

### 2. Install Dependencies

```
npm install
```

---

### 3. Build React Application

```
npm run build
```

Produces:

```
dist/
```

---

### 4. Upload to Amazon S3

The generated static website files are uploaded to the S3 bucket.

The upload synchronizes only changed files.

---

### 5. CloudFront Cache Invalidation

CloudFront cache is invalidated to ensure users receive the latest frontend version.

Example:

```
/*
```

---

# Frontend Pipeline Diagram

```
Developer

↓

GitHub

↓

GitHub Actions

↓

React Build

↓

Amazon S3

↓

CloudFront

↓

Users
```

---

# GitHub Actions

The project uses GitHub Actions workflows to automate deployments.

Current workflows include:

- Backend Deployment
- Frontend Deployment
- Terraform Infrastructure Deployment
- Workflow Cleanup Utility

---

# GitHub Secrets

Sensitive information is stored securely using GitHub Secrets.

Examples include:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- ECR Repository
- Terraform Variables

No credentials are stored in source code.

---

# Infrastructure Deployment

Infrastructure is deployed using Terraform as part of the CI/CD process.

Terraform performs:

- Infrastructure Validation
- Planning
- Resource Creation
- Resource Updates

This ensures infrastructure remains consistent with the Terraform configuration.

---

# Deployment Strategy

The current deployment strategy uses **rolling updates**.

Benefits include:

- Minimal downtime
- Automated replacement of unhealthy tasks
- Continuous service availability

Future enhancement:

- Blue-Green Deployment
- Canary Deployment

---

# Failure Handling

The CI/CD pipeline includes validation steps to reduce deployment failures.

Examples include:

- Terraform validation
- Build failure detection
- Docker build validation
- ECS health checks
- CloudFront cache refresh
- GitHub Actions workflow status

---

# Security

The CI/CD process follows security best practices.

Implemented measures:

- GitHub Secrets
- IAM Least Privilege
- Docker Image Versioning
- Infrastructure as Code
- HTTPS Deployment
- Secure AWS Authentication

---

# Benefits

The automated CI/CD pipeline provides:

- Faster deployments
- Consistent infrastructure
- Reduced manual effort
- Repeatable deployments
- Automated container publishing
- Reliable application updates
- Improved developer productivity

---

# Future Improvements

Potential enhancements include:

- Automatic Security Scanning (Trivy)
- TFLint Validation
- SonarQube Code Quality
- Approval Gates for Production
- Blue-Green Deployment
- Slack or Microsoft Teams Notifications
- Automated Rollback

---

# Summary

The Nivasabid project uses GitHub Actions to automate both application deployment and infrastructure provisioning. Separate backend and frontend pipelines allow independent deployments, while Terraform ensures infrastructure consistency through Infrastructure as Code. This approach enables reliable, repeatable, and production-ready deployments with minimal manual intervention.