# syntax=docker/dockerfile:1

# Build stage: Maven and source code never enter the runtime image.
FROM maven:3.9.11-amazoncorretto-17 AS builder

WORKDIR /build

# Keep dependency resolution in its own cached layer. The cache mount is used
# when BuildKit is enabled and does not become part of the resulting image.
COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 \
    mvn --batch-mode --no-transfer-progress dependency:go-offline

# Copy only what is needed to build the application, keeping database scripts
# and local development files out of the build context/image layers.
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn --batch-mode --no-transfer-progress clean package -DskipTests

# Distroless contains only a Java runtime and its required libraries: no shell,
# package manager, Maven cache, or compiler in production.
FROM gcr.io/distroless/java17-debian12:nonroot

WORKDIR /app

# Spring Boot's finalName makes this artifact name deterministic.
COPY --from=builder --chown=65532:65532 /build/target/nivasabid.jar /app/app.jar

USER 65532:65532

# Size the JVM from the container memory limit; override at deployment time
# with JAVA_TOOL_OPTIONS when a workload needs different values.
ENV JAVA_TOOL_OPTIONS="-XX:InitialRAMPercentage=25.0 -XX:MaxRAMPercentage=75.0"

EXPOSE 8080
STOPSIGNAL SIGTERM

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
