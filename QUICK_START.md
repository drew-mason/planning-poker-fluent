# Quick Start Guide - Planning Poker Fluent

Get up and running in 10 minutes!

# Quick Start Guide - Planning Poker Fluent

**🎯 Current Environment**: `dev353895.service-now.com` (Zurich Release)  
**📅 Last Updated**: October 31, 2025  
**✅ Status**: CLI Authorized and Ready for Deployment

## Prerequisites

```bash
node --version   # Should be v18.0.0+
npm --version    # Should be v9.0.0+
git --version    # Any recent version
```

## 5-Step Setup

### Step 1: Install Dependencies (2 min)

```bash
cd planning-poker-fluent
npm install
```

### Step 2: Configure Environment (2 min)

```bash
npm run setup
```

Or manually:
```bash
cp .env.example .env
# Edit .env with your ServiceNow credentials
```

### Step 3: Validate Data Model (1 min)

```bash
npm run validate
```

Expected output:
```
✓ All validations passed!
```

### Step 4: Deploy Tables (3 min)

```bash
npm run sync:tables
```

Or manually create tables using JSON definitions in `src/tables/`

### Step 5: Seed Data (2 min)

In ServiceNow Background Scripts, run:
```javascript
// Copy contents of scripts/setup/seed-data.js
```

Expected output:
```
*** Script: [Seed Data] Created 4 scoring methods and 38 scoring values.
*** Script: [Seed Data] Default method: T-Shirt Sizes
```

## Verify Setup

Run this in ServiceNow Background Scripts:

```javascript
// Test query
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .select()
  .toArray(10);

gs.info('✓ GlideQuery working! Found ' + sessions.length + ' sessions');

// Check default method
var defaultMethod = new GlideQuery('x_902080_msmplnpkr_fluent_scoring_method')
  .where('is_default', true)
  .selectOne('name')
  .get();

gs.info('✓ Default scoring method: ' + defaultMethod.name);
// Should output: T-Shirt Sizes
```

## Development Workflow

### Watch for Changes
```bash
npm run dev
```

### Make Changes
1. Edit files in `src/`
2. Changes auto-sync to ServiceNow
3. Test in ServiceNow UI
4. Check logs for errors

### Run Tests
```bash
npm run test          # All tests
npm run lint          # Code quality
npm run compare       # Compare with legacy
npm run benchmark     # Performance tests
```

## Common Commands

```bash
# Development
npm run dev              # Auto-sync on changes
npm run sync             # Manual sync all
npm run validate         # Validate data model

# Quality
npm run lint             # Check code
npm run lint:fix         # Fix issues
npm run ci               # Run CI pipeline locally

# Testing
npm run test             # All tests
npm run compare          # Legacy comparison
npm run benchmark        # Performance

# Deployment
npm run deploy:dev       # Deploy to dev instance
```

## Project Structure

```
planning-poker-fluent/
├── src/tables/              # 7 table definitions (JSON)
├── src/server/              # Server-side code
├── src/client/              # Client-side code
├── scripts/setup/           # Setup scripts
├── scripts/utilities/       # Dev utilities
├── docs/                    # Documentation
└── .github/workflows/       # CI/CD pipelines
```

## Next Steps

1. **Read Documentation**
   - [Architecture Overview](docs/architecture/OVERVIEW.md)
   - [ERD Diagram](docs/architecture/ERD.md)
   - [Fluent Patterns Guide](docs/architecture/FLUENT_PATTERNS.md)

2. **Start Development**
   - Phase 1: Data Layer (Weeks 3-4)
   - Implement Fluent query patterns
   - Create Script Includes

3. **Run Benchmarks**
   ```bash
   npm run benchmark
   ```

4. **Compare with Legacy**
   ```bash
   npm run compare
   ```

## Troubleshooting

### Issue: npm install fails
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Issue: Cannot connect to ServiceNow
1. Check `.env` file has correct instance URL
2. Verify username/password
3. Ensure instance is not hibernated

### Issue: Table creation fails
1. Verify you have `admin` role
2. Check scope: `x_902080_msmplnpkr_fluent`
3. Review ServiceNow system logs

### Issue: Seed data script fails
1. Ensure tables are created first
2. Check GlideQuery is available (Zurich+)
3. Review Background Scripts output

## Default Configuration

- **Scope**: `x_902080_msmplnpkr_fluent`
- **Default Scoring Method**: T-Shirt Sizes (XS, S, M, L, XL, XXL, ?, Coffee)
- **Tables**: 7 (no Task inheritance)
- **Indexes**: 18 composite indexes

## Key Features

✅ Fluent (GlideQuery) for 30-60% performance improvement
✅ T-shirt sizing as default estimation method
✅ Vote versioning for history tracking
✅ Summary fields for fast queries
✅ Side-by-side deployment with legacy
✅ Comprehensive comparison framework

## Support

- **Documentation**: `docs/` directory
- **Setup Issues**: See `docs/setup/SETUP.md`
- **Architecture Questions**: See `docs/architecture/OVERVIEW.md`
- **Fluent Patterns**: See `docs/architecture/FLUENT_PATTERNS.md`

## Quick Reference

### ServiceNow Tables
```
x_902080_msmplnpkr_fluent_planning_session
x_902080_msmplnpkr_fluent_session_stories
x_902080_msmplnpkr_fluent_planning_vote
x_902080_msmplnpkr_fluent_scoring_method
x_902080_msmplnpkr_fluent_scoring_value
x_902080_msmplnpkr_fluent_session_participant
x_902080_msmplnpkr_fluent_session_voter_groups
```

### Example Fluent Query
```javascript
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('dealer', gs.getUserID())
  .where('status', 'active')
  .orderByDesc('created_on')
  .select('sys_id', 'name', 'scoring_method.name')
  .limit(10)
  .toArray(10);
```

---

**Quick Start Version**: 1.0
**Last Updated**: 2025-10-31
**Ready to Code**: Yes! 🚀
