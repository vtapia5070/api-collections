# API Collections

A monorepo hosting multiple independent backend APIs, each serving distinct domains. This setup facilitates experimentation with various technologies and architectures, with potential for inter-service communication.

## 🎯 Goals

-   **Modular Architecture:** Self-contained APIs for independent development and deployment
-   **Technology Exploration:** Experimenting with different ORMs and databases
-   **Shared Utilities:** Reusable common modules across services
-   **Scalability:** Foundation for potential microservices architecture

## Available Services

### 🐱 Meow Service

Located in `apps/meow-service`, built with NestJS.

#### Setup

```bash
# Install dependencies
cd apps/meow-service
npm install

# Development
npm run start:dev
# of from the root
npm run meow:dev

# Production build
npm run build
npm run start:prod
```

Service runs at `http://localhost:3000` by default.

#### API Documentation

After starting the service, access the Swagger documentation at:

-   `http://localhost:3000/api` - Swagger UI
-   `http://localhost:3000/api-json` - OpenAPI specification

## Development

Each service in the `apps` directory is independent, allowing for:

-   Different technology stacks
-   Separate deployment pipelines
-   Independent scaling
-   Service-specific documentation

## Repository Structure

```
api-collections/
├── apps/
│   └── meow-service/     # NestJS-based API service
└── lib/              # Future shared services and utilities
```
