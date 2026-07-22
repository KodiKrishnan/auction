# ==========================
# Stage 1 - Build
# ==========================
FROM maven:3.9.11-amazoncorretto-17 AS builder

WORKDIR /build

# Copy pom first for dependency caching
COPY pom.xml .

RUN mvn dependency:go-offline

# Copy source
COPY . .

# Build
RUN mvn clean package -DskipTests

# ==========================
# Stage 2 - Runtime
# ==========================
FROM amazoncorretto:17-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=builder /build/target/*.jar app.jar

RUN chown -R spring:spring /app

USER spring

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]