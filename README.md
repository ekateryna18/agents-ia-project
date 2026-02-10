# Freelancing Tool - Backend

> A multi-agent TDD project demonstrating requirements-to-deployment automation

[![CI Status](https://github.com/ekateryna18/agents-ia-project/actions/workflows/ci.yml/badge.svg)](https://github.com/ekateryna18/agents-ia-project/actions)

## Project Overview

This backend service is part of a freelancing tool that combines task management with accountability features. The project demonstrates a complete multi-agent development workflow from requirements analysis to CI/CD pipeline automation.

### Core Features (Current)

- **Calculate Project Hours**: Aggregates approved time entries for a project
- **100% Test Coverage**: Comprehensive unit tests
- **Type Safety**: Full TypeScript implementation
- **Automated CI/CD**: GitHub Actions pipeline

## Tech Stack

- **Runtime**: Node.js 18.x / 20.x
- **Language**: TypeScript 5.x
- **Testing**: Jest with ts-jest
- **Linting**: ESLint with TypeScript support
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm 8.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/ekateryna18/agents-ia-project.git
cd agents-ia-project/backend

# Install dependencies
npm ci

# Run tests
npm test

# Run linter
npm run lint

# Build project
npm run build
```

## Development

### Available Scripts

- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix linting issues automatically
- `npm run build` - Build production bundle
- `npm run dev` - Start development server

### Project Structure

```
backend/
├── src/
│   └── domain/
│       ├── services/
│       │   └── timeEntryService.ts    # Business logic
│       └── errors/
│           ├── ValidationError.ts
│           ├── NotFoundError.ts
│           └── DatabaseError.ts
├── tests/
│   └── unit/
│       └── services/
│           └── timeEntryService.test.ts
├── .github/
│   └── workflows/
│       └── ci.yml                      # CI pipeline
└── package.json
```

## Testing

This project follows Test-Driven Development (TDD) principles:

### Current Test Coverage

```
Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Coverage:    100% (Statements, Branches, Functions, Lines)
```

### Test Cases

1. Calculate sum of approved time entries
2. Include only approved entries (exclude draft/deleted)
3. Return 0 when project has no time entries
4. Return 0 when project has only draft entries
5. Return 0 when project has only deleted entries
6. Throw ValidationError when projectId is null
7. Throw ValidationError when projectId is invalid UUID
8. Throw NotFoundError when project doesn't exist
9. Return result with 2 decimal precision

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

### Pipeline Steps

1. **Checkout** - Clone repository
2. **Setup Node.js** - Install Node.js (18.x, 20.x matrix)
3. **Install Dependencies** - `npm ci` with caching
4. **Lint** - ESLint checks
5. **Test** - Jest with coverage
6. **Coverage Check** - Enforce 80% minimum
7. **Build** - TypeScript compilation

### Quality Gates

- ✅ All tests must pass
- ✅ Linting must pass (0 errors)
- ✅ Coverage must be >= 80%
- ✅ Build must succeed

## Multi-Agent Development Workflow

This project was developed using a multi-agent TDD workflow:

```
Analyst → Architect → Dev → TestWorker → CodeWorker → DevSecOps
```

Each agent has specific responsibilities:
- **Analyst**: Requirements analysis, user stories, business rules
- **Architect**: Technical design, database schema, API specs
- **Dev**: TDD coordination, task decomposition
- **TestWorker**: Test writing and execution
- **CodeWorker**: Implementation
- **DevSecOps**: CI/CD pipeline setup

## Core Entities

- **User**: Freelancers and clients
- **Project**: Container for tasks and time tracking
- **Task**: Individual work items
- **TimeEntry**: Time logged on project work
- **Invoice**: Billing based on approved hours

## Contributing

This project follows strict TDD principles:

1. Write tests first (RED)
2. Implement to pass tests (GREEN)
3. Refactor if needed (REFACTOR)
4. All tests must pass before merging
5. Maintain 80%+ coverage

## License

ISC

## Authors

- **Katy** - Project Lead
- **Claude Sonnet 4.5** - Multi-Agent Development System

---

**Built with multi-agent TDD methodology** 🤖
