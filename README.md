# API Collections

A monorepo hosting multiple independent backend APIs, each serving distinct domains. This setup facilitates experimentation with various technologies and architectures, with potential for inter-service communication.

## 🎯 Goals

- **Modular Architecture:** Self-contained APIs for independent development and deployment
- **Technology Exploration:** Experimenting with different ORMs and databases
- **Shared Utilities:** Reusable common modules across services
- **Scalability:** Foundation for potential microservices architecture

## Available Services

### 🐱 Meow Service

Located in `apps/meow-service`, built with NestJS, Docker, Postgres

## Development

Each service in the `apps` directory is independent, allowing for:

- Different technology stacks
- Separate deployment pipelines
- Independent scaling
- Service-specific documentation

## Repository Structure

```
api-collections/
├── apps/
│   └── meow-service/     # NestJS-based API service
└── lib/              # Future shared services and utilities
```
