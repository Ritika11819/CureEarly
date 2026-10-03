FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
RUN addgroup --system curearly && adduser --system --ingroup curearly curearly
WORKDIR /app
COPY --from=build /workspace/target/curearly-api-0.1.0.jar app.jar
USER curearly
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
