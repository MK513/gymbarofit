# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-jammy AS builder

<<<<<<< HEAD
ARG APP_MODULE=api

WORKDIR /workspace

=======
WORKDIR /workspace

# Copy Gradle wrapper and dependency descriptor first (layer cache)
>>>>>>> origin/main
COPY gradle/ gradle/
COPY gradlew .
COPY settings.gradle .
COPY build.gradle .
COPY core/build.gradle core/build.gradle
<<<<<<< HEAD
COPY ${APP_MODULE}/build.gradle ${APP_MODULE}/build.gradle
=======
COPY api/build.gradle api/build.gradle
>>>>>>> origin/main

# Fix Windows CRLF line endings and set executable bit
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Download dependencies before copying source (improves layer caching)
RUN ./gradlew dependencies --no-daemon -q || true

<<<<<<< HEAD
COPY core/ core/
COPY ${APP_MODULE}/ ${APP_MODULE}/

RUN ./gradlew :${APP_MODULE}:bootJar --no-daemon -x test
=======
# Copy source code
COPY core/ core/
COPY api/ api/

# Build the fat JAR; skip tests (tests need a running H2 server)
RUN ./gradlew :api:bootJar --no-daemon -x test
>>>>>>> origin/main

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy AS runtime

<<<<<<< HEAD
ARG APP_MODULE=api

WORKDIR /app

RUN mkdir -p /app/images /app/logs

COPY images/ /app/images/

COPY --from=builder /workspace/${APP_MODULE}/build/libs/*.jar app.jar

EXPOSE 8080 8081
=======
WORKDIR /app

# Create upload directory for images
RUN mkdir -p /app/images

# Create log directory
RUN mkdir -p /app/logs

# Copy seed images into the container (for named volume initialization)
COPY images/ /app/images/

# Copy the built JAR from builder stage
COPY --from=builder /workspace/api/build/libs/*.jar app.jar

EXPOSE 8080
>>>>>>> origin/main

ENTRYPOINT ["java", "-jar", "app.jar"]
