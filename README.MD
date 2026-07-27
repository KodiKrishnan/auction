# 🏡 Nivasabid – Property Auction Platform

<p align="center">
  <strong>Cloud-native property auction platform</strong><br>
  React web application · Spring Boot API · AWS infrastructure
</p>

<p align="center">
  <a href="https://aws.amazon.com/">AWS</a> ·
  <a href="https://www.terraform.io/">Terraform</a> ·
  <a href="https://www.docker.com/">Docker</a> ·
  <a href="https://github.com/features/actions">GitHub Actions</a>
</p>

<p align="center">
  <img src="docs/images/architecture.png" alt="Nivasabid AWS architecture" width="100%">
</p>

Nivasabid is a full-stack property marketplace and auction platform for property owners, travellers, and administrators. The repository contains the application code, local development environment, AWS infrastructure, and automated deployment workflows.

> **Current delivery scope:** the checked-in deployment workflows target the UAT environment. Review the [production readiness checklist](#production-readiness) before using this configuration for production workloads.

## Contents

- [Capabilities](#capabilities)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Local development](#local-development)
- [Validation](#validation)
- [AWS infrastructure](#aws-infrastructure)
- [CI/CD](#cicd)
- [Configuration](#configuration)
- [Security and operations](#security-and-operations)
- [Production readiness](#production-readiness)
- [Troubleshooting](#troubleshooting)

## Capabilities

- Property discovery with location, type, rule, and amenity metadata.
- Owner workflows for registration, profile completion, KYC upload, property management, media management, rules, and auction status.
- Traveller workflows for registration, profile management, property details, and wishlists.
- Google OAuth sign-in with JWT-backed application sessions.
- Property image and video upload through the backend media integration.
- Scheduled auction expiry/status processing.
- Administrative master-data management for locations, property types, amenities, packages, and rules.
- Health checks through Spring Boot Actuator at `/actuator/health`.

## Architecture

The reference deployment separates public entry points, application workloads, and data services:

| Layer | Service | Responsibility |
| --- | --- | --- |
| Edge | Amazon CloudFront | Global delivery for the frontend and custom-domain TLS |
| Web | Amazon S3 | Private static frontend origin |
| API entry | Application Load Balancer | HTTPS termination and backend health checks |
| Application | Amazon ECS on Fargate | Spring Boot API tasks in private application subnets |
| Images | Amazon ECR | Backend and frontend container image repositories |
| Data | Amazon RDS for MySQL | Relational application data in private database subnets |
| Network | Amazon VPC | Public, private application, and private database subnets |
| Operations | Amazon CloudWatch | Container and database logs |
| Identity and TLS | IAM, ACM, Security Groups | Access control, certificates, and network boundaries |

The infrastructure is composed with Terraform modules for VPC, security groups, IAM, ECR, RDS, ALB, ECS, S3, CloudFront, and ACM.

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite 8, React Router, Material UI, Axios |
| Backend | Java 17, Spring Boot 4, Spring Security, Spring Data JPA |
| Authentication | Google OAuth, JWT |
| Database | MySQL 8.4 |
| Media | Cloudinary integration |
| Local runtime | Docker Compose |
| Infrastructure | Terraform >= 1.8, AWS provider 6.x |
| Delivery | GitHub Actions, Amazon ECR, ECS, S3, CloudFront |

## Repository layout

```text
.
├── backend/                    # Spring Boot API and tests
├── frontend/                   # React/Vite application
├── docker/                     # Local Compose stack and database script
├── infrastructure/
│   ├── bootstrap/              # Creates the Terraform state bucket
│   └── terraform/              # Reusable AWS infrastructure composition
├── docs/images/                # Architecture diagram
├── .github/actions/            # Composite Terraform actions
└── .github/workflows/          # CI/CD and infrastructure workflows
```

## Prerequisites

Install the following before starting local development:

- Git
- Java 17 and a JDK
- Node.js 22 and npm
- Docker Engine with Docker Compose v2
- Terraform >= 1.8 for infrastructure work
- AWS CLI and an AWS account for cloud operations

For AWS work, configure credentials using an approved organization method and confirm the target account and region before running Terraform. The default region in the checked-in UAT configuration is `ap-south-1`.

## Local development

### Run the complete stack with Docker Compose

The Compose stack runs MySQL, the Spring Boot API, and the Nginx-served frontend.

1. Create `docker/.env` from your organization’s local secret-management process. The file must define the variables in the [configuration](#configuration) table; do not commit credentials.
2. Start the stack:

   ```bash
   cd docker
   docker compose up --build
   ```

3. Open the frontend at `http://localhost:5173`.
4. Check the API at `http://localhost:8080/actuator/health`.

Stop the services with `Ctrl+C`. To remove the containers and local database volume:

```bash
cd docker
docker compose down -v
```

The `-v` option deletes local MySQL data and should not be used against a shared environment.

### Run services individually

For faster frontend iteration, run the API and frontend separately after starting a MySQL instance with the required schema:

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend, in another terminal
cd frontend
npm ci
npm run dev
```

The frontend defaults to `http://localhost:8080` for API requests. Override it with `VITE_API_BASE_URL` when the API is hosted elsewhere.

## Validation

Run focused checks before opening a pull request:

```bash
# Frontend dependencies, lint, and production build
cd frontend
npm ci
npm run lint
npm run build

# Backend tests
cd ../backend
./mvnw test

# Terraform formatting and syntax validation
cd ../infrastructure/terraform
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

The backend CI workflow currently performs a package build with tests skipped. Run `./mvnw test` locally or add a required test stage to CI before treating a change as release-ready.

## AWS infrastructure

Terraform uses an encrypted, versioned S3 backend with lock-file state locking. The state bucket must exist before initializing the main stack.

### Bootstrap the Terraform backend

Run this once per AWS account, or use the organization’s existing state-management process:

```bash
cd infrastructure/bootstrap
terraform init
terraform plan
terraform apply
```

The bootstrap defaults are in `infrastructure/bootstrap/terraform.tfvars`. Confirm the bucket name is globally unique and approved before applying.

### Plan or apply an environment

The root configuration contains `dev`, `uat`, and `prod` variable files. The checked-in UAT file is the active CI/CD target.

```bash
cd infrastructure/terraform
terraform init

# Supply these through a secret manager, CI environment, or shell session.
export TF_VAR_google_client_id="<google-client-id>"
export TF_VAR_jwt_secret="<strong-random-secret>"

terraform plan \
  -var-file=environments/uat.tfvars \
  -var="container_image_tag=<ecr-image-tag>"

# Apply only after reviewing the plan and confirming the AWS account.
terraform apply \
  -var-file=environments/uat.tfvars \
  -var="container_image_tag=<ecr-image-tag>"
```

Terraform also requires DNS validation records for the ACM certificates. Complete certificate validation in the authoritative DNS account before expecting HTTPS listeners and CloudFront aliases to become available.

## CI/CD

All workflows use GitHub Actions and deploy to UAT unless explicitly changed in the workflow configuration.

| Workflow | Trigger | Result |
| --- | --- | --- |
| `backend-ci.yml` | Push to `main` touching `backend/` | Builds the Spring Boot artifact, builds a Docker image, and pushes it to ECR |
| `backend-cd.yml` | Successful `Backend CI` run | Updates the ECS task definition and waits for service stability |
| `frontend.yml` | Push to `main` touching `frontend/` | Builds the Vite app, syncs `dist/` to S3, and invalidates CloudFront |
| `terraform-plan.yml` | Pull request to `main` or manual dispatch | Initializes Terraform, runs quality checks, and publishes a plan artifact/summary |
| `terraform-apply.yml` | Push to `main` touching infrastructure or manual dispatch | Applies the UAT Terraform variable set behind the `terraform-uat` GitHub environment |

Required GitHub secrets include AWS credentials, `AWS_REGION`, `AWS_ACCOUNT_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `JWT_SECRET`. Prefer short-lived AWS credentials through GitHub OIDC rather than long-lived access keys.

## Configuration

The following variables are used by the local Compose stack. Values are examples of names only; keep secrets outside source control.

| Variable | Used by | Description |
| --- | --- | --- |
| `MYSQL_DATABASE` | MySQL | Database created by the local container |
| `MYSQL_USER` / `MYSQL_PASSWORD` | MySQL/API | Application database credentials |
| `MYSQL_ROOT_PASSWORD` | MySQL | Local administrative password |
| `SPRING_DATASOURCE_URL` | API | JDBC connection string |
| `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` | API | Runtime database credentials |
| `JWT_SECRET` | API | Secret used to sign application tokens |
| `GOOGLE_CLIENT_ID` | API | Google OAuth client identifier |
| `SPRING_PROFILES_ACTIVE` | API | Spring profile, such as `local` or `uat` |
| `SERVER_PORT` | API | API listen port |
| `VITE_API_BASE_URL` | Frontend | API base URL embedded at build time |
| `VITE_API_GOOGLE_KEY` | Frontend | Google Maps/browser API key embedded at build time |

`VITE_*` values are public client-side build inputs, not server-side secrets. Restrict browser keys by application and API referrer in Google Cloud. Rotate any credential that has ever been committed, logged, or shared outside the intended secret store.

## Security and operations

- TLS certificates are provisioned with ACM for the ALB and CloudFront; DNS validation is required.
- ECS tasks run in private application subnets and RDS runs in private database subnets.
- Security groups restrict traffic between the load balancer, ECS, and database tiers.
- ECS task roles and execution roles are provisioned through Terraform IAM modules.
- RDS credentials are generated and exposed to ECS through AWS Secrets Manager references.
- `/actuator/health` is used as the ALB target health check.
- Backend container logs and selected RDS logs are sent to CloudWatch.

For incident response, first verify ALB target health, ECS service events, CloudWatch logs, RDS availability, and the most recent image/task-definition revision. Avoid making manual changes in AWS without recording the equivalent Terraform change.

## Production readiness

The repository is a strong deployment reference, but the current Terraform and workflow defaults are UAT-oriented. Before production use, complete and review at least the following:

- Move all application and provider credentials out of tracked configuration and rotate any exposed values.
- Replace long-lived GitHub AWS access keys with OIDC and least-privilege role assumption.
- Enable RDS Multi-AZ, deletion protection, final snapshots, an approved backup/PITR policy, and an appropriate maintenance window.
- Increase CloudWatch retention, enable ALB access logs, and define alerting for 5xx responses, unhealthy targets, ECS restarts, database storage, and failed deployments.
- Replace `spring.jpa.hibernate.ddl-auto=update` with an explicit, reviewed migration strategy.
- Add dependency, container, IaC, and secret scanning as required merge gates.
- Define environment promotion, rollback, approval, and disaster-recovery procedures.
- Add API contract documentation, integration tests, load tests, and a documented data-retention policy.
- Verify WAF, rate limiting, CORS, cookie/token handling, backup restore, and access reviews against organizational policy.

## Troubleshooting

### Frontend cannot reach the API

Confirm `VITE_API_BASE_URL` points to the API origin, rebuild the frontend after changing it, and verify that port `8080` is reachable from the browser.

### Backend fails during startup

Check the datasource URL, username, password, active profile, and MySQL health. With Compose, inspect service logs:

```bash
cd docker
docker compose logs -f mysql backend
```

### ECS tasks are unhealthy

Check the `/actuator/health` response from the target group, ECS service events, container logs, security-group paths, and the task definition’s image tag and environment references.

### Terraform initialization fails

Confirm AWS credentials, the selected account and region, the state bucket from `infrastructure/terraform/backend.tf`, and the required ACM DNS validation records.

## Ownership

Keep application behavior, infrastructure changes, and operational procedures documented alongside the code. Pull requests should describe the affected environment, validation performed, migration/rollback impact, and any required secret or DNS changes.
