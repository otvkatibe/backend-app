<!-- markdownlint-disable MD024 -->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-13

### Added

- **API Documentation**: Full Swagger/OpenAPI support accessible via `/api-docs`.
- **Recurring Transactions**: New module to handle automated financial transactions (Cron-based).
- **Hardening**:
  - Idempotency checks to prevent double-charges.
  - BOLA (Broken Object Level Authorization) protection in middlewares.
  - Redis resilience with connection retry logic.
- **Reporting**: PDF and CSV export capabilities (`/reports`).
- **Security**: Added `helmet` recommendations and `rate-limit` hardening using Redis store.

### Changed

- **Route Standardization**: Migrated all routes to pass controller methods directly (Express 5 async handling).
- **Error Handling**: Unified error format via `errorHandler` middleware.
- **Testing**:
  - Stabilized E2E suite (`--runInBand`) resolving concurrency issues.
  - Mocked global rate-limiters for predictable test outcomes.
- **Database**: Migrated validation logic to Zod schemas for strict typing.

### Fixed

- **Authentication**: Corrected route paths in tests (`/users/register` -> `/users`).
- **Swagger**: Resolved duplicate YAML tags and schema references in `user.route.ts`.
- **Performance**: Optimized Redis connection handling and timeout settings.

## [1.0.0] - 2026-01-01

### Added

- Initial release with basic Wallet, Transaction, and User (Auth/RBAC) modules.
- Postgres + Prisma ORM setup.
- Basic Jest testing infrastructure.
