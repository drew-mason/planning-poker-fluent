# Setup Guide - Planning Poker Fluent

Complete setup instructions for the Planning Poker Fluent implementation.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```

2. **npm** (v9 or higher)
   ```bash
   npm --version  # Should be v9.0.0 or higher
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **ServiceNow CLI** (optional but recommended)
   ```bash
   npm install -g @servicenow/cli
   snc --version
   ```

### ServiceNow Requirements

- **Instance**: ServiceNow Zurich release or later
- **Permissions**:
  - `admin` role OR
  - `app_engine_studio` role
  - Access to create tables and applications
- **Plugins**: None required (uses core platform)

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd planning-poker-fluent
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- ServiceNow CLI tools
- ESLint with ServiceNow config
- Testing frameworks (Mocha, Chai, Sinon)
- Utility libraries (chalk, cli-table3, commander)

## Step 3: Configure Environment

### Create .env File

```bash
cp .env.example .env
```

### Edit .env with Your Credentials

```bash
# Instance URL (without https://)
SN_INSTANCE=dev353895.service-now.com

# Authentication
SN_USERNAME=your.username
SN_PASSWORD=your.password

# Application Scope
SN_SCOPE=x_902080_msmplnpkr_fluent

# Development Environment
NODE_ENV=development

# Feature Flags
ENABLE_COMPARISON_TESTS=true
ENABLE_PERFORMANCE_MONITORING=true

# Legacy Application Scope (for comparison tests)
LEGACY_SCOPE=x_902080_msmplnpkr
```

**IMPORTANT**: Never commit .env to version control!

## Step 4: Validate Data Model

Before deploying, validate all table schemas:

```bash
npm run validate
```

Expected output:
```
=== Data Model Validation ===

Validating planning_session_fluent.json...
✓ planning_session_fluent.json validated

Validating session_stories_fluent.json...
✓ session_stories_fluent.json validated

... (all 7 tables)

Validating relationships...
✓ Relationship validation complete

=== Validation Summary ===

✓ All validations passed!
```

## Step 5: Create Tables in ServiceNow

### Option A: Using ServiceNow SDK (Recommended)

```bash
npm run sync:tables
```

This command:
1. Reads all JSON files from `src/tables/`
2. Creates tables in your ServiceNow instance
3. Applies indexes and relationships

### Option B: Manual Creation via Studio

1. Log into ServiceNow instance
2. Navigate to **System Applications** > **Studio**
3. Create new application:
   - Name: `Planning Poker - Fluent`
   - Scope: `x_902080_msmplnpkr_fluent`
4. For each table JSON in `src/tables/`:
   - Create table with matching definition
   - Add all fields
   - Create indexes

## Step 6: Seed Initial Data

The seed data script creates scoring methods with **T-shirt sizing as default**.

### Run in ServiceNow Background Scripts

1. Navigate to **System Definition** > **Scripts - Background**
2. Copy contents of `scripts/setup/seed-data.js`
3. Paste into script window
4. Click **Run script**

Expected output:
```
*** Script: [Seed Data] Starting data setup for Planning Poker Fluent...
*** Script: [Seed Data] Created scoring method: T-Shirt Sizes (DEFAULT)
*** Script: [Seed Data] Created scoring method: Fibonacci Sequence
*** Script: [Seed Data] Created scoring method: Modified Fibonacci
*** Script: [Seed Data] Created scoring method: Powers of 2
*** Script: [Seed Data] Completed! Created 4 scoring methods and 38 scoring values.
*** Script: [Seed Data] Default method: T-Shirt Sizes
```

### Verify Seed Data

Run this in Background Scripts to verify:

```javascript
// Check default scoring method
var defaultMethod = new GlideQuery('x_902080_msmplnpkr_fluent_scoring_method')
  .where('is_default', true)
  .selectOne('name')
  .get();

gs.info('Default method: ' + defaultMethod.name);
// Should output: Default method: T-Shirt Sizes

// Check T-shirt values
var values = new GlideQuery('x_902080_msmplnpkr_fluent_scoring_value')
  .where('scoring_method.name', 'T-Shirt Sizes')
  .orderBy('order')
  .select('value')
  .toArray(100);

gs.info('T-shirt values: ' + values.map(function(v) { return v.value; }).join(', '));
// Should output: XS, S, M, L, XL, XXL, ?, Coffee
```

## Step 7: Configure Access Controls

### Create Application Access

1. Navigate to **System Applications** > **Applications**
2. Find `Planning Poker - Fluent`
3. Add roles:
   - `x_902080_msmplnpkr_fluent.dealer` - Can create and manage sessions
   - `x_902080_msmplnpkr_fluent.participant` - Can vote in sessions
   - `x_902080_msmplnpkr_fluent.admin` - Full application access

### Grant Yourself Roles

```javascript
// Run in Background Scripts
var user = new GlideRecord('sys_user');
user.addQuery('user_name', 'your.username');
user.query();
if (user.next()) {
  // Add dealer role
  var role = new GlideRecord('sys_user_has_role');
  role.initialize();
  role.setValue('user', user.sys_id);
  role.setValue('role', 'x_902080_msmplnpkr_fluent.dealer');
  role.insert();

  gs.info('Dealer role granted');
}
```

## Step 8: Verify Setup

### Run All Validation Checks

```bash
npm run ci
```

This runs:
1. ESLint code quality checks
2. Data model validation
3. Unit tests (when available)

### Test Table Access

Run in Background Scripts:

```javascript
// Test session creation
var session = new GlideRecord('x_902080_msmplnpkr_fluent_planning_session');
session.initialize();
session.setValue('name', 'Test Session');
session.setValue('dealer', gs.getUserID());
session.setValue('status', 'pending');

// Get default scoring method
var defaultMethod = new GlideQuery('x_902080_msmplnpkr_fluent_scoring_method')
  .where('is_default', true)
  .selectOne('sys_id')
  .get();

session.setValue('scoring_method', defaultMethod.sys_id);
var sessionId = session.insert();

gs.info('Test session created: ' + sessionId);
gs.info('Default scoring method: T-Shirt Sizes');

// Clean up
session.get(sessionId);
session.deleteRecord();
gs.info('Test session deleted');
```

Expected output:
```
*** Script: Test session created: <sys_id>
*** Script: Default scoring method: T-Shirt Sizes
*** Script: Test session deleted
```

## Step 9: Development Workflow Setup

### Enable Auto-Sync (Optional)

For development, enable automatic sync on file changes:

```bash
npm run dev
```

This watches `src/` directory and syncs changes to ServiceNow.

### Install Git Hooks (Optional)

Automatically run linting before commits:

```bash
npx husky install
npx husky add .git/hooks/pre-commit "npm run precommit"
```

## Step 10: Run Comparison Tests

If you have the legacy Planning Poker installed, test compatibility:

```bash
npm run compare
```

This compares:
- Query performance (Fluent vs GlideRecord)
- Data consistency
- Functional equivalence

## Troubleshooting

### Issue: "Cannot connect to ServiceNow instance"

**Solution**:
1. Verify `.env` file has correct instance URL
2. Check username/password are correct
3. Ensure instance is accessible (not hibernated)
4. Try logging into instance manually

### Issue: "Table creation failed"

**Solution**:
1. Verify you have `admin` or `app_engine_studio` role
2. Check scope name matches: `x_902080_msmplnpkr_fluent`
3. Ensure no tables with same name exist
4. Review ServiceNow system logs

### Issue: "Seed data script fails"

**Solution**:
1. Verify tables were created successfully
2. Check GlideQuery is available (Zurich+)
3. Review script syntax in Background Scripts
4. Check for error messages in output

### Issue: "npm install fails"

**Solution**:
1. Verify Node.js version >= 18
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules/` and retry
4. Check internet connectivity

### Issue: "ESLint errors"

**Solution**:
1. Auto-fix many issues: `npm run lint:fix`
2. Review `.eslintrc.js` configuration
3. Check file syntax (ES5 for ServiceNow)
4. Ensure globals are declared

## Next Steps

After successful setup:

1. **Explore Data Model**: Review ERD in `docs/architecture/ERD.md`
2. **Read Architecture**: Understand patterns in `docs/architecture/`
3. **Start Development**: Begin Phase 1 - Data Layer implementation
4. **Run Benchmarks**: Test performance with `npm run benchmark`
5. **Configure CI/CD**: Set up GitHub Actions secrets

## Development Commands Reference

```bash
# Development
npm run dev              # Watch and auto-sync
npm run sync             # Sync all files
npm run sync:tables      # Sync only tables
npm run sync:server      # Sync only server code
npm run sync:client      # Sync only client code

# Quality
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix issues
npm run validate         # Validate data model

# Testing
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run compare          # Compare with legacy
npm run benchmark        # Performance tests

# Deployment
npm run deploy           # Full deployment
npm run deploy:dev       # Deploy to dev
npm run ci               # CI pipeline locally
```

## Support

- **Documentation**: `docs/` directory
- **Issues**: Create GitHub issue
- **Questions**: Contact team lead

---

**Setup Guide Version**: 1.0
**Last Updated**: 2025-10-31
**Phase**: 0 - Setup & Infrastructure
