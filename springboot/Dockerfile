# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /workspace

# Copy Gradle wrapper and dependency descriptor first (layer cache)
COPY gradle/ gradle/
COPY gradlew .
COPY settings.gradle .
COPY build.gradle .
COPY core/build.gradle core/build.gradle
COPY api/build.gradle api/build.gradle

# Fix Windows CRLF line endings and set executable bit
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Download dependencies before copying source (improves layer caching)
RUN ./gradlew dependencies --no-daemon -q || true

# Copy source code
COPY core/ core/
COPY api/ api/

# Build the fat JAR; skip tests (tests need a running H2 server)
RUN ./gradlew :api:bootJar --no-daemon -x test

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy AS runtime

WORKDIR /app

# Create upload directory for images
RUN mkdir -p /app/images

# Copy seed images into the container (for named volume initialization)
COPY images/ /app/images/

# Copy the built JAR from builder stage
COPY --from=builder /workspace/api/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
