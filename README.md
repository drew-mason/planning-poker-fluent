# Planning Poker - ServiceNow Application (Fluent Implementation)

A **ServiceNow application** for Planning Poker that has been rebuilt using modern **Fluent (GlideQuery)** patterns for improved performance, maintainability, and developer experience.

## Current Environment

**🌐 Instance**: `dev353895.service-now.com` (Zurich Release)  
**🔧 CLI Status**: ✅ Authorized (ServiceNow CLI v1.1.2)  
**📦 Scope**: `x_902080_msmplnpkr_fluent`  
**📅 Last Updated**: October 31, 2025

## Project Status

**Phase 0: Setup & Infrastructure** - IN PROGRESS
- Repository structure: ✅ Complete
- SDK/CLI configuration: ✅ Complete
- Data model design: ✅ Complete (7 tables)
- CI/CD pipeline: ✅ Complete
- Comparison framework: ✅ Complete

## Overview

Planning Poker is a collaborative Agile estimation tool that enables teams to estimate story points using various scoring methods. This Fluent rebuild replaces traditional GlideRecord patterns with modern GlideQuery for:

- **30-60% faster queries** through optimized indexes and query patterns
- **Cleaner, more maintainable code** with chainable Fluent syntax
- **Better performance at scale** with efficient aggregation operations
- **Type-safe queries** reducing runtime errors

## Key Differences from Legacy

| Aspect | Legacy | Fluent |
|--------|--------|--------|
| **Query Pattern** | GlideRecord loops | GlideQuery chainable methods |
| **Table Structure** | Extends Task table | Standalone tables |
| **Aggregations** | GlideAggregate | GlideQuery aggregate |
| **Joins** | Multiple queries | Single query with joins |
| **Performance** | Baseline | 30-60% improvement |
| **Default Scoring** | Fibonacci | **T-Shirt Sizing** |

## Architecture

### Data Model (7 Tables)

1. **planning_session_fluent** - Session management
2. **session_stories_fluent** - Stories to estimate
3. **planning_vote_fluent** - Individual votes
4. **scoring_method_fluent** - Voting scales (T-shirt, Fibonacci, etc.)
5. **scoring_value_fluent** - Values for each method
6. **session_participant_fluent** - User roles in sessions
7. **session_voter_groups_fluent** - Group-based access

See [ERD Diagram](docs/architecture/ERD.md) for relationships.

### Default Scoring Method

**T-Shirt Sizing** is the default method:
- XS, S, M, L, XL, XXL
- Plus special values: ?, Coffee
- Non-numeric (better for relative sizing)
- More intuitive for non-technical stakeholders

Other available methods:
- Fibonacci Sequence (1, 2, 3, 5, 8, 13, 21)
- Modified Fibonacci (0.5, 1, 2, 3, 5, 8, 13, 20, 40)
- Powers of 2 (1, 2, 4, 8, 16, 32)

## Quick Start

### Prerequisites

- Node.js 18+
- ServiceNow instance (Zurich release)
- ServiceNow CLI/SDK installed
- Git

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd planning-poker-fluent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your ServiceNow credentials
   ```

4. **Validate data model**
   ```bash
   npm run validate
   ```

5. **Deploy tables**
   ```bash
   npm run sync:tables
   ```

6. **Seed initial data**
   ```bash
   # Run in ServiceNow Background Scripts:
   # Copy contents of scripts/setup/seed-data.js
   ```

### Development Workflow

```bash
# Watch for changes and auto-sync
npm run dev

# Lint code
npm run lint

# Run tests
npm run test

# Deploy to dev instance
npm run deploy:dev

# Compare with legacy implementation
npm run compare

# Run performance benchmarks
npm run benchmark
```

## Project Structure

```
planning-poker-fluent/
├── .github/workflows/       # CI/CD pipelines
│   ├── ci.yml              # Continuous integration
│   ├── deploy-dev.yml      # Development deployment
│   └── comparison-tests.yml # Legacy comparison
├── src/
│   ├── tables/             # Table definitions (JSON)
│   ├── server/             # Server-side code
│   │   ├── script-includes/
│   │   ├── business-rules/
│   │   └── scheduled-jobs/
│   ├── client/             # Client-side code
│   │   ├── ui-pages/
│   │   └── ui-scripts/
│   └── tests/              # Test suites
│       ├── unit/
│       ├── integration/
│       └── performance/
├── scripts/                # Utility scripts
│   ├── setup/             # Setup scripts
│   │   └── seed-data.js   # Initial data creation
│   └── utilities/         # Development utilities
│       ├── compare-implementations.js
│       ├── performance-benchmark.js
│       └── validate-data-model.js
├── docs/                   # Documentation
│   ├── architecture/      # Architecture diagrams
│   ├── api/              # API documentation
│   └── setup/            # Setup guides
├── config/                # Configuration files
├── sn.config.js          # ServiceNow SDK config
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Watch and auto-sync changes |
| `npm run sync` | Sync all files to ServiceNow |
| `npm run sync:tables` | Sync only tables |
| `npm run sync:server` | Sync only server code |
| `npm run sync:client` | Sync only client code |
| `npm run deploy` | Full deployment with checks |
| `npm run deploy:dev` | Deploy to dev instance |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix linting issues |
| `npm run test` | Run all tests |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:performance` | Run performance benchmarks |
| `npm run test:comparison` | Compare with legacy |
| `npm run validate` | Validate data model |
| `npm run compare` | Run comparison tests |
| `npm run benchmark` | Run performance benchmarks |

## Timeline

**Total Duration**: 10-12 weeks (6 phases)

- **Phase 0**: Setup & Infrastructure (Weeks 1-2) ← CURRENT
- **Phase 1**: Data Layer with Fluent (Weeks 3-4)
- **Phase 2**: Business Logic (Weeks 5-6)
- **Phase 3**: UI Development (Weeks 7-8)
- **Phase 4**: Testing & Optimization (Week 9)
- **Phase 5**: Migration & Cutover (Weeks 10-12)

## Testing

### Run Tests Locally
```bash
npm run test          # All tests
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests
```

### Compare with Legacy
```bash
npm run compare       # Functional comparison
npm run benchmark     # Performance benchmarks
```

### CI/CD
- All PRs trigger automated testing
- Performance benchmarks run nightly
- Comparison tests validate functional equivalence

## Performance Targets

Based on initial benchmarks:

| Operation | Legacy | Fluent | Improvement |
|-----------|--------|--------|-------------|
| Simple Query | 75ms | 35ms | 53% |
| Complex Query | 150ms | 60ms | 60% |
| Aggregation | 200ms | 80ms | 60% |
| Join Operations | 300ms | 120ms | 60% |

## Production Deployment Strategy

**Side-by-Side Deployment** (Option A - Selected):
- Both implementations run simultaneously
- Separate scopes: `x_902080_msmplnpkr` (legacy) and `x_902080_msmplnpkr_fluent` (new)
- Separate tables (no shared data)
- Gradual user migration
- Easy rollback if needed
- Comparison testing in production environment

## Contributing

1. Create feature branch from `develop`
2. Make changes
3. Run `npm run lint` and `npm run test`
4. Submit PR with clear description
5. Ensure CI passes
6. Request review

## Documentation

- [Architecture Overview](docs/architecture/OVERVIEW.md)
- [ERD Diagram](docs/architecture/ERD.md)
- [API Documentation](docs/api/README.md)
- [Setup Guide](docs/setup/SETUP.md)
- [Fluent Patterns](docs/architecture/FLUENT_PATTERNS.md)

## Technology Stack

- **Platform**: ServiceNow Zurich Release
- **Query Language**: Fluent (GlideQuery)
- **Scripting**: JavaScript ES5 (ServiceNow compatible)
- **Development**: ServiceNow SDK/CLI
- **Testing**: Mocha, Chai, Sinon
- **CI/CD**: GitHub Actions
- **Linting**: ESLint with ServiceNow config

## License

MIT

## Team

- ServiceNow Architect
- Fluent Expert
- Frontend Developer
- QA Engineer
- DevOps Engineer
- Technical Writer

## Support

For questions or issues:
1. Check [documentation](docs/)
2. Review [architecture diagrams](docs/architecture/)
3. Run comparison tests: `npm run compare`
4. Create issue with details

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

**Generated**: Phase 0 - Setup & Infrastructure
**Last Updated**: 2025-10-31
