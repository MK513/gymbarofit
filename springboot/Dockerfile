# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-jammy AS builder

ARG APP_MODULE=api

WORKDIR /workspace

COPY gradle/ gradle/
COPY gradlew .
COPY settings.gradle .
COPY build.gradle .
COPY core/build.gradle core/build.gradle
COPY ${APP_MODULE}/build.gradle ${APP_MODULE}/build.gradle

# Fix Windows CRLF line endings and set executable bit
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Download dependencies before copying source (improves layer caching)
RUN ./gradlew dependencies --no-daemon -q || true

COPY core/ core/
COPY ${APP_MODULE}/ ${APP_MODULE}/

RUN ./gradlew :${APP_MODULE}:bootJar --no-daemon -x test

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy AS runtime

ARG APP_MODULE=api

WORKDIR /app

RUN mkdir -p /app/images /app/logs

COPY images/ /app/images/

COPY --from=builder /workspace/${APP_MODULE}/build/libs/*.jar app.jar

EXPOSE 8080 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
