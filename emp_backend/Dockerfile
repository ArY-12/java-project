# Build stage
FROM maven:3.9.0-eclipse-temurin-17 AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src
COPY mvnw* ./

RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
