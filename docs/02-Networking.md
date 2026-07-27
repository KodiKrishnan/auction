# 🌐 Networking Architecture

## Overview

The Nivasabid infrastructure is deployed inside a dedicated **Amazon Virtual Private Cloud (VPC)**. The network is designed to isolate public-facing resources from internal application and database resources while maintaining secure communication between services.

The networking architecture follows AWS best practices by separating workloads into multiple subnets across different Availability Zones.

---

# Network Architecture

<p align="center">
    <img src="./images/networking.png" width="100%">
</p>

---

# Design Goals

The networking architecture is designed to achieve:

- High Availability
- Network Isolation
- Security
- Scalability
- Fault Tolerance
- Least Privilege Access

---

# Virtual Private Cloud (VPC)

The VPC provides an isolated virtual network for all AWS resources used by the application.

It contains:

- Public Subnets
- Private Application Subnets
- Private Database Subnets
- Internet Gateway
- NAT Gateway
- Route Tables
- Security Groups

---

# Availability Zones

The infrastructure is deployed across multiple Availability Zones to improve availability and fault tolerance.

Benefits include:

- Higher Availability
- Better Fault Isolation
- Improved Disaster Recovery
- Load Distribution

---

# Subnet Architecture

The VPC is divided into three subnet tiers.

```
Internet
    │
    ▼
Public Subnets
    │
    ▼
Private Application Subnets
    │
    ▼
Private Database Subnets
```

---

# Public Subnets

## Purpose

Public subnets host resources that must be reachable from the internet.

Resources include:

- Application Load Balancer (ALB)
- NAT Gateway

These subnets have a route to the Internet Gateway.

---

# Private Application Subnets

## Purpose

Private application subnets host the backend application.

Resources include:

- Amazon ECS Fargate Tasks

Characteristics

- No Public IP Address
- No Direct Internet Access
- Accessible only through the ALB
- Outbound internet access through NAT Gateway

This ensures the backend application cannot be accessed directly from the internet.

---

# Private Database Subnets

## Purpose

Private database subnets host the relational database.

Resources include:

- Amazon RDS MySQL

Characteristics

- No Internet Access
- No Public IP
- Accessible only from ECS Tasks
- Protected using Security Groups

This provides an additional layer of security for application data.

---

# Internet Gateway

The Internet Gateway connects the VPC to the public internet.

Responsibilities:

- Internet Connectivity
- Inbound Requests
- Outbound Requests

Only public subnets have routes to the Internet Gateway.

---

# NAT Gateway

The NAT Gateway enables outbound internet connectivity for resources inside private subnets.

Typical use cases include:

- Downloading Docker images
- Operating System updates
- Accessing AWS APIs
- Third-party API calls

The NAT Gateway blocks unsolicited inbound traffic.

---

# Route Tables

Each subnet is associated with a route table.

## Public Route Table

```
Destination      Target

0.0.0.0/0        Internet Gateway
```

Used by:

- ALB
- NAT Gateway

---

## Private Application Route Table

```
Destination      Target

0.0.0.0/0        NAT Gateway
```

Used by:

- ECS Tasks

---

## Private Database Route Table

Contains only local VPC routes.

Used by:

- Amazon RDS

The database has no internet connectivity.

---

# Security Groups

Security Groups act as virtual firewalls for AWS resources.

---

## Application Load Balancer Security Group

### Inbound

| Port | Source |
|------|--------|
| 80 | Internet |
| 443 | Internet |

### Outbound

Allow all traffic to ECS Tasks.

---

## ECS Security Group

### Inbound

| Port | Source |
|------|--------|
| 8080 | ALB Security Group |

### Outbound

Allow access to:

- Amazon RDS
- AWS Services
- Internet (via NAT)

---

## RDS Security Group

### Inbound

| Port | Source |
|------|--------|
| 3306 | ECS Security Group |

The database only accepts connections from the backend application.

No direct internet access is allowed.

---

# Network Traffic Flow

## Frontend

```
User

↓

CloudFront

↓

Amazon S3

↓

React Application
```

CloudFront serves cached static content from edge locations.

---

## Backend

```
User

↓

CloudFront

↓

Application Load Balancer

↓

Amazon ECS Fargate

↓

Spring Boot API

↓

Amazon RDS MySQL
```

The backend remains inside private subnets throughout the request lifecycle.

---

# Internal Communication

```
ALB
 │
 ▼
ECS Tasks
 │
 ▼
Amazon RDS
```

All internal communication occurs within the VPC.

No traffic traverses the public internet.

---

# Security Best Practices

The networking architecture follows AWS security best practices.

Implemented controls include:

- Private Application Subnets
- Private Database Subnets
- Security Groups
- HTTPS Encryption
- SSL/TLS Certificates
- Least Privilege Access
- Network Isolation

---

# High Availability

High availability is achieved through:

- Multi-AZ Deployment
- Redundant Public Subnets
- Redundant Private Subnets
- Application Load Balancer
- Amazon ECS Service
- Amazon RDS Multi-AZ

---

# Network Benefits

The architecture provides:

- Secure network segmentation
- Scalable infrastructure
- Reduced attack surface
- High availability
- Fault tolerance
- Controlled network access
- Compliance with AWS networking best practices

---

# Summary

The networking architecture separates internet-facing resources from application and database resources using a layered subnet design.

Public resources are limited to the Application Load Balancer and NAT Gateway, while the backend application and database remain protected within private subnets. Security Groups, route tables, and VPC networking ensure that each component communicates only with the resources it requires, providing a secure and scalable foundation for the Nivasabid platform.