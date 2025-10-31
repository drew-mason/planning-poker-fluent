# Architecture Overview - Planning Poker Fluent

## Vision

Rebuild the Planning Poker application using modern ServiceNow Fluent (GlideQuery) patterns to deliver:
- **30-60% performance improvement** over legacy GlideRecord
- **Cleaner, more maintainable code** with chainable query syntax
- **Better scalability** through optimized indexes and queries
- **Type-safe queries** reducing runtime errors

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Voting     │  │   Session    │  │   Statistics    │   │
│  │  Interface   │  │  Management  │  │   Dashboard     │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└────────────┬────────────────┬────────────────┬─────────────┘
             │                │                │
             ├────────────────┴────────────────┤
             │         GlideAjax API           │
             └────────────────┬────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Session    │  │    Voting    │  │   Statistics    │   │
│  │  Management  │  │  Operations  │  │   Analytics     │   │
│  │ Script Inc.  │  │ Script Inc.  │  │  Script Inc.    │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Business   │  │   Business   │  │   Scheduled     │   │
│  │    Rules     │  │    Rules     │  │      Jobs       │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└────────────┬────────────────┬────────────────┬─────────────┘
             │                │                │
             ├────────────────┴────────────────┤
             │      Fluent Query Layer         │
             │         (GlideQuery)            │
             └────────────────┬────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Planning   │  │   Session    │  │    Planning     │   │
│  │   Session    │  │   Stories    │  │      Vote       │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Scoring    │  │   Scoring    │  │    Session      │   │
│  │   Method     │  │    Value     │  │  Participant    │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│  ┌──────────────┐                                           │
│  │   Session    │                                           │
│  │ Voter Groups │                                           │
│  └──────────────┘                                           │
└──────────────────────────────────────────────────────────────┘
```

## Layered Architecture

### 1. Data Layer

**7 Tables** - Optimized for Fluent queries with composite indexes

- **planning_session_fluent**: Core session management
- **session_stories_fluent**: Stories to estimate
- **planning_vote_fluent**: Individual votes with versioning
- **scoring_method_fluent**: Voting scales (T-shirt, Fibonacci, etc.)
- **scoring_value_fluent**: Values for each method
- **session_participant_fluent**: User roles (dealer, participant, spectator)
- **session_voter_groups_fluent**: Group-based access control

**Key Design Decisions**:
- No Task table inheritance (standalone tables)
- Composite indexes matching query patterns
- Summary fields for performance
- Vote versioning for history

### 2. Fluent Query Layer

**Modern GlideQuery Patterns**:
- Chainable methods for readability
- Automatic query optimization
- Built-in aggregations
- Join support for related data
- Type-safe queries

**Example**:
```javascript
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('dealer', dealerId)
  .where('status', 'active')
  .orderByDesc('created_on')
  .select('sys_id', 'name', 'scoring_method.name')
  .limit(10)
  .toArray(10);
```

### 3. Business Logic Layer

**Script Includes** (Fluent-based):
- `SessionManagementFluent.script.js`: CRUD operations
- `VotingOperationsFluent.script.js`: Vote casting, revealing
- `StatisticsCalculatorFluent.script.js`: Analytics
- `ParticipantManagerFluent.script.js`: Role management

**Business Rules**:
- Summary field updates (automatic counts)
- Status transitions
- Auto-completion logic
- Validation

**Scheduled Jobs**:
- Session cleanup (completed sessions)
- Vote archival
- Performance monitoring

### 4. Client Layer

**UI Pages**:
- Voting Interface: Real-time voting experience
- Session Management: CRUD for sessions
- Statistics Dashboard: Analytics and insights

**Client Scripts**:
- AJAX calls to Script Includes
- DOM manipulation
- Real-time updates
- Validation

## Data Flow Patterns

### Session Lifecycle

```
1. CREATE
   └─> planning_session_fluent (status: pending)
       ├─> Set default scoring_method (T-shirt sizing)
       └─> Create session_participant (dealer)

2. ACTIVATE
   └─> Add session_stories_fluent
       └─> Update status: pending → active

3. VOTING
   └─> Set current_story
       ├─> Story status: pending → voting
       └─> Participants cast planning_vote_fluent

4. REVEAL
   └─> Story status: voting → revealed
       ├─> Calculate statistics (avg, min, max, consensus)
       └─> Display results to participants

5. COMPLETE STORY
   └─> Set final_score
       ├─> Story status: revealed → completed
       ├─> Auto-advance to next story
       └─> Update summary fields

6. COMPLETE SESSION
   └─> When all stories done
       ├─> Session status: active → completed
       └─> Set end_time
```

### Vote Flow with Versioning

```
INITIAL VOTE:
┌─────────────────────────────────────┐
│ vote_sequence: 1                    │
│ is_current: true                    │
│ vote_value: "M" (T-shirt)           │
└─────────────────────────────────────┘

RE-VOTE TRIGGERED:
┌─────────────────────────────────────┐
│ Previous votes:                     │
│   vote_sequence: 1                  │
│   is_current: false (marked old)    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ New votes:                          │
│   vote_sequence: 2                  │
│   is_current: true                  │
└─────────────────────────────────────┘

HISTORY PRESERVED:
└─> Analytics on vote changes
└─> Track consensus improvement
└─> Enable "undo" functionality
```

### Summary Field Updates

**Automatic Maintenance via Business Rules**:

```
planning_vote INSERT → triggers:
├─ session_stories.vote_count++
└─ planning_session.total_votes++

session_stories.status UPDATE → triggers:
├─ IF status = 'completed':
│  └─ planning_session.stories_completed++
├─ IF status = 'skipped':
│  └─ planning_session.stories_skipped++
└─ Check if all stories done:
   └─ Auto-complete session
```

## Performance Optimizations

### 1. Composite Indexes

Indexes match common query patterns:

```javascript
// Query: Get active sessions for dealer
new GlideQuery('planning_session_fluent')
  .where('dealer', dealerId)      // ←┐
  .where('status', 'active')      // ←┤ Uses idx_session_dealer_status
  .orderByDesc('created_on')      // ←┘
  .select()
  .toArray(10);
```

### 2. Summary Fields vs. Dynamic Calculations

**❌ Legacy (Slow)**:
```javascript
// Count votes every time
var gr = new GlideRecord('planning_vote');
gr.addQuery('session', sessionId);
gr.query();
var count = gr.getRowCount(); // Database query
```

**✅ Fluent (Fast)**:
```javascript
// Read pre-calculated field
var session = new GlideQuery('planning_session_fluent')
  .where('sys_id', sessionId)
  .selectOne('total_votes')
  .get();
var count = session.total_votes; // No query needed
```

### 3. Batch Operations

Use Fluent's built-in aggregations:

```javascript
// Get statistics in single query
var stats = new GlideQuery('session_stories_fluent')
  .where('session', sessionId)
  .aggregate('sum', 'vote_count')
  .aggregate('avg', 'vote_count')
  .aggregate('count', 'sys_id')
  .selectOne()
  .get();
```

### 4. Efficient Joins

Avoid N+1 queries:

```javascript
// Single query with join
var sessions = new GlideQuery('planning_session_fluent')
  .where('status', 'active')
  .select('sys_id', 'name', 'scoring_method.name', 'dealer.name')
  .toArray(50);
```

## Comparison Framework

### Side-by-Side Testing

Run both implementations simultaneously:

```
┌──────────────────┐     ┌──────────────────┐
│  Legacy Scope    │     │  Fluent Scope    │
│  x_902080_...pkr │     │  x_902080_...flt │
└──────────────────┘     └──────────────────┘
        ↓                         ↓
┌──────────────────┐     ┌──────────────────┐
│  GlideRecord     │     │  GlideQuery      │
│  Queries         │     │  Queries         │
└──────────────────┘     └──────────────────┘
        ↓                         ↓
┌──────────────────────────────────────────┐
│      Comparison Test Framework           │
│  • Query performance                     │
│  • Data consistency                      │
│  • Functional equivalence                │
└──────────────────────────────────────────┘
```

### Metrics Tracked

- Query execution time
- Database queries generated
- Memory usage
- User experience (page load times)
- Data accuracy
- Functional parity

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Platform** | ServiceNow Zurich Release |
| **Query Language** | Fluent (GlideQuery) |
| **Server Scripting** | JavaScript ES5 |
| **Client Scripting** | JavaScript ES5 + jQuery |
| **Development** | ServiceNow SDK/CLI + VS Code |
| **Testing** | Mocha + Chai + Sinon |
| **CI/CD** | GitHub Actions |
| **Linting** | ESLint with ServiceNow config |

## Security Model

### Access Control

- **Table-level ACLs**: Control CRUD operations
- **Role-based access**:
  - `dealer`: Create/manage sessions
  - `participant`: Vote in sessions
  - `spectator`: View-only access
  - `admin`: Full application control

### Data Isolation

- Scoped application: `x_902080_msmplnpkr_fluent`
- Private tables (no cross-scope access)
- User context validation
- Input sanitization

## Extensibility Points

### 1. Custom Scoring Methods

Add new voting scales beyond default (T-shirt, Fibonacci):
- Create scoring_method record
- Define scoring_value records
- No code changes required

### 2. Event Hooks

Business rules provide extension points:
- Before/After session creation
- Before/After vote casting
- Status change events
- Auto-completion triggers

### 3. External Integrations

Script Includes support:
- REST API calls
- Webhook notifications
- Analytics export
- Agile tool integration (Jira, ADO)

## Migration Strategy

### Phase 0: Setup (Weeks 1-2) ✅
- Repository structure
- SDK/CLI configuration
- Data model design
- CI/CD pipeline

### Phase 1: Data Layer (Weeks 3-4)
- Create tables
- Fluent query patterns
- Unit tests

### Phase 2: Business Logic (Weeks 5-6)
- Script Includes
- Business rules
- Integration tests

### Phase 3: UI (Weeks 7-8)
- UI pages
- Client scripts
- UI testing

### Phase 4: Testing (Week 9)
- E2E testing
- Performance optimization
- Security review

### Phase 5: Cutover (Weeks 10-12)
- Production deployment
- User migration
- Comparison testing
- Documentation

## Success Criteria

- [ ] 30-60% performance improvement
- [ ] 100% functional parity with legacy
- [ ] Zero data loss during migration
- [ ] <100ms page load for voting interface
- [ ] <50ms for simple queries
- [ ] 95%+ test coverage
- [ ] Zero critical security issues
- [ ] Complete documentation

---

**Architecture Version**: 1.0
**Last Updated**: 2025-10-31
**Status**: Phase 0 Complete
