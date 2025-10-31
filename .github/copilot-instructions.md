# AI Agent Instructions - Planning Poker Fluent

## Current Environment Status

**🌐 ServiceNow Instance**: `dev353895.service-now.com` (Zurich Release)  
**🔧 CLI Authorization**: ✅ ServiceNow CLI v1.1.2 (Basic Auth)  
**📦 Application Scope**: `x_902080_msmplnpkr_fluent`  
**🔄 Last Updated**: October 31, 2025  
**📊 Fluent App Status**: ✅ Verified (21/21 checks passed)

## Project Overview
This is a **complete rebuild** of a ServiceNow Planning Poker application using **Fluent (GlideQuery)** patterns instead of traditional GlideRecord. The goal is 30-60% performance improvement through modern query patterns.

**Key Architecture**: Side-by-side deployment with separate scopes (`x_902080_msmplnpkr_fluent` vs legacy `x_902080_msmplnpkr`), standalone tables (no Task inheritance), and T-Shirt Sizing as default scoring method.

## Essential Development Patterns

### Query Pattern (Critical)
Always use **GlideQuery** instead of GlideRecord:
```javascript
// NEVER use GlideRecord loops
var participants = new GlideQuery('session_participant')
  .where('session', sessionId)
  .select('user.name', 'role')  // Auto-join references
  .map(p => ({ name: p.user.name, role: p.role }));
```

### Code Quality Standards
Every implementation must include:
- **Before/After comparisons** showing legacy vs Fluent
- **Performance metrics** (measured with 100 iterations)
- **Line-of-code reduction** percentages (target: 40-56% reduction)
- **Comments explaining optimization choices**

### Table Naming Convention
All tables use prefix: `x_902080_msmplnpkr_fluent_` (7 core tables)
- `planning_session_fluent` - Main sessions
- `session_stories_fluent` - Stories to estimate  
- `planning_vote_fluent` - Individual votes
- `scoring_method_fluent` - Voting scales (T-shirt, Fibonacci)
- `scoring_value_fluent` - Values for each method
- `session_participant_fluent` - User roles
- `session_voter_groups_fluent` - Group access

### Table Schema Pattern
Follow this optimized structure for all tables:
```javascript
{
  "extends": "",  // NO inheritance for performance
  "fields": [
    // Summary fields for pre-calculated values
    { "name": "total_stories", "type": "integer", "read_only": true },
    { "name": "stories_completed", "type": "integer", "read_only": true }
  ],
  "indexes": [
    // Composite indexes matching query patterns
    { "fields": ["status", "created_by", "sys_created_on"] }
  ]
}
```

### Business Rules Pattern
Use **summary fields** instead of live calculations:
```javascript
// Maintain these in business rules (read-only fields):
session.total_stories = storyCount;
session.stories_completed = completedCount;
// Avoid COUNT queries in UI - use pre-calculated fields
```

### UI Page Structure (Mandatory)
**ALWAYS separate HTML and JavaScript:**
```
src/client/ui-pages/[page_name]/
├── [page_name].html.html          # XML/Jelly + HTML + CSS ONLY
└── [page_name].client_script.js   # Pure JavaScript ONLY
```

### Error Handling Pattern
Use Fluent's built-in error handling:
```javascript
const session = new GlideQuery('planning_session')
  .where('sys_id', sessionId)
  .selectOne()
  .orElseThrow('Session not found');
```

## Development Workflow

### Essential Commands
```bash
npm run dev          # Watch mode - auto-sync changes
npm run sync:tables  # Deploy table changes only
npm run compare      # Compare with legacy implementation
npm run benchmark    # Performance testing
npm run validate     # Validate data model
```

### ServiceNow SDK Scope
Always use scope: `x_902080_msmplnpkr_fluent` in sn.config.js and all deployments.

### Seed Data Requirements
Default scoring method is **T-Shirt Sizing** (XS, S, M, L, XL, XXL, ?, Coffee). Run `scripts/setup/seed-data.js` in Background Scripts after table creation.

## Performance Targets
- Simple queries: 35ms (53% improvement over legacy)
- Complex queries: 60ms (60% improvement)  
- Aggregations: 80ms (60% improvement)
- Joins: 120ms (60% improvement)

## Testing Strategy

### Comparison Framework
Use `scripts/utilities/compare-implementations.js` to validate functional equivalence with legacy system. All new features must pass comparison tests.

### Performance Monitoring
Use `scripts/utilities/performance-benchmark.js` for query optimization. Include before/after metrics in code reviews.

### ATF Test Structure
Write comprehensive tests covering:
```javascript
// Unit tests for individual functions
describe('FluentQueryHelper.getSafe', function() {
  it('should return record when exists', function() {
    const result = FluentQueryHelper.getSafe('incident', testSysId, ['number']);
    expect(result).toBeDefined();
  });
});

// Integration tests for AJAX methods
describe('PlanningPokerSessionAjax.getSession', function() {
  it('should retrieve complete session data', function() {
    const response = JSON.parse(ajax.getSession());
    expect(response.success).toBe(true);
  });
});
```

## Code Standards

### Fluent Best Practices
Follow patterns from `.claude/agents/fluent-expert.md`:
- **Avoid while loops**: Use `.map()`, `.reduce()`, `.forEach()` instead
- **Use `.orElseThrow()` for validation**: Cleaner error handling
- **Leverage automatic reference resolution**: `record.user.name` instead of nested queries
- **Implement functional aggregations**: Single-pass reduce instead of multiple loops

### Common Fluent Pitfalls to Avoid
1. **Reference field access**: Use `p.user.name` not `p.user` (returns sys_id string)
2. **Lazy evaluation**: Queries don't execute until terminal operation (`.select()`, `.map()`)
3. **Async context**: Use `await` when needed, handle promises properly
4. **Workflow control**: Use `.withWorkflow(false)` not `.setWorkflow(false)`

### Error Handling
Use Fluent's built-in error handling:
```javascript
const session = new GlideQuery('planning_session')
  .where('sys_id', sessionId)
  .selectOne()
  .orElseThrow('Session not found');
```

### Reference Field Navigation
Leverage automatic joins instead of nested queries:
```javascript
// Good - single query with auto-join
session.dealer.name
// Bad - multiple queries
var dealer = new GlideRecord('sys_user'); dealer.get(session.dealer);
```

### Functional Patterns
Use map/reduce instead of while loops:
```javascript
const voteCounts = votes.reduce((acc, vote) => {
  acc[vote.value] = (acc[vote.value] || 0) + 1;
  return acc;
}, {});
```

## Integration Points

### CI/CD Pipeline
- All PRs trigger automated testing via GitHub Actions
- Performance benchmarks run nightly
- Comparison tests validate functional equivalence
- Use `npm run ci` before submitting PRs

### Environment Configuration
Use `.env` for instance credentials. Support dev/test/prod targets via `npm run deploy:dev`.

## Troubleshooting

### Common Issues
- **Sync failures**: Check watch mode running (`npm run dev`)
- **Performance issues**: Verify indexes match query patterns, use `scripts/utilities/performance-benchmark.js`
- **Data model changes**: Run `npm run validate` after table modifications

### Debug Patterns
```javascript
// Test queries in Background Scripts
var result = new GlideQuery('planning_session')
  .where('status', 'active')
  .select('name', 'dealer.name')
  .toArray(10);
gs.info('Results: ' + JSON.stringify(result));
```

## Key Files to Reference
- `docs/architecture/ERD.md` - Complete data model relationships
- `src/tables/*.json` - Table definitions with calculated fields
- `scripts/setup/seed-data.js` - Initial data structure and T-shirt sizing setup
- `sn.config.js` - ServiceNow SDK configuration with scope settings
- `.claude/agents/` - Specialized agent instructions for different roles (fluent-expert, servicenow-architect, frontend-developer, etc.)