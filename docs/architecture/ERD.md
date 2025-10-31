# Entity Relationship Diagram (ERD)

## Planning Poker Fluent - Data Model

### Visual Overview

```
┌─────────────────────────────┐
│   planning_session_fluent   │
│─────────────────────────────│
│ + sys_id (PK)              │
│   name                      │
│   description               │
│   dealer → sys_user         │
│   scoring_method → (FK)     │
│   status                    │
│   current_story → (FK)      │
│   start_time                │
│   end_time                  │
│   total_stories (calc)      │
│   stories_completed (calc)  │
│   stories_skipped (calc)    │
│   total_votes (calc)        │
│   allow_spectators          │
│   auto_reveal               │
└─────────────────────────────┘
         ↓ 1:N
         │
         ↓
┌─────────────────────────────┐       ┌─────────────────────────────┐
│   session_stories_fluent    │       │   scoring_method_fluent     │
│─────────────────────────────│       │─────────────────────────────│
│ + sys_id (PK)              │       │ + sys_id (PK)              │
│   session → (FK)            │       │   name                      │
│   story → rm_story (opt)    │       │   description               │
│   title                     │       │   is_default (T-shirt!)     │
│   description               │       │   is_active                 │
│   acceptance_criteria       │       │   is_numeric                │
│   order                     │       │   order                     │
│   status                    │       └─────────────────────────────┘
│   final_score               │                ↓ 1:N
│   vote_count (calc)         │                │
│   times_revoted (calc)      │                ↓
│   average_score (calc)      │       ┌─────────────────────────────┐
│   min_score (calc)          │       │   scoring_value_fluent      │
│   max_score (calc)          │       │─────────────────────────────│
│   consensus_reached (calc)  │       │ + sys_id (PK)              │
└─────────────────────────────┘       │   scoring_method → (FK)     │
         ↓ 1:N                        │   value (e.g., "XS", "5")   │
         │                            │   numeric_value (optional)  │
         ↓                            │   order                     │
┌─────────────────────────────┐       │   is_special (?, Coffee)    │
│   planning_vote_fluent      │       │   description               │
│─────────────────────────────│       └─────────────────────────────┘
│ + sys_id (PK)              │
│   session → (FK)            │
│   session_story → (FK)      │
│   voter → sys_user          │
│   vote_value                │
│   vote_sequence             │
│   is_current                │
│   voted_at                  │
└─────────────────────────────┘


┌─────────────────────────────┐       ┌─────────────────────────────┐
│ session_participant_fluent  │       │session_voter_groups_fluent  │
│─────────────────────────────│       │─────────────────────────────│
│ + sys_id (PK)              │       │ + sys_id (PK)              │
│   session → (FK)            │       │   session → (FK)            │
│   user → sys_user           │       │   group → sys_user_group    │
│   role (dealer/part/spec)   │       │   is_active                 │
│   is_active                 │       └─────────────────────────────┘
│   joined_at                 │
│   last_activity             │
└─────────────────────────────┘
```

## Table Relationships

### Core Session Management

**planning_session_fluent** (Parent)
- **1:N → session_stories_fluent**: A session contains multiple stories
- **1:N → planning_vote_fluent**: A session accumulates votes across all stories
- **1:N → session_participant_fluent**: A session has multiple participants
- **1:N → session_voter_groups_fluent**: A session can allow multiple groups
- **N:1 ← scoring_method_fluent**: Each session uses one scoring method
- **N:1 ← sys_user** (dealer): Each session has one dealer

### Story Management

**session_stories_fluent**
- **N:1 ← planning_session_fluent**: Stories belong to one session
- **1:N → planning_vote_fluent**: A story receives multiple votes
- **N:1 ← rm_story** (optional): May reference an Agile story

### Voting System

**planning_vote_fluent**
- **N:1 ← planning_session_fluent**: Votes belong to one session
- **N:1 ← session_stories_fluent**: Votes target one story
- **N:1 ← sys_user** (voter): Each vote cast by one user

### Scoring Configuration

**scoring_method_fluent** (Parent)
- **1:N → scoring_value_fluent**: A method defines multiple values
- **1:N → planning_session_fluent**: A method used by multiple sessions

**scoring_value_fluent**
- **N:1 ← scoring_method_fluent**: Values belong to one method

### Access Control

**session_participant_fluent**
- **N:1 ← planning_session_fluent**: Participants belong to one session
- **N:1 ← sys_user**: Each participant record for one user
- **UNIQUE**: (session, user) - One record per user per session

**session_voter_groups_fluent**
- **N:1 ← planning_session_fluent**: Groups belong to one session
- **N:1 ← sys_user_group**: Each record references one group
- **UNIQUE**: (session, group) - One record per group per session

## Key Indexes (Optimized for Fluent Queries)

### planning_session_fluent
- `idx_session_status_dealer` (status, dealer)
- `idx_session_status_created` (status, created_on)
- `idx_session_dealer_status` (dealer, status, created_on)

### session_stories_fluent
- `idx_story_session_order` (session, order)
- `idx_story_session_status` (session, status)
- `idx_story_reference` (story)

### planning_vote_fluent
- `idx_vote_story_voter_current` (session_story, voter, is_current)
- `idx_vote_session_current` (session, is_current)
- `idx_vote_story_sequence` (session_story, vote_sequence, is_current)

### session_participant_fluent
- `idx_participant_session_user` (session, user) **UNIQUE**
- `idx_participant_session_active` (session, is_active, role)
- `idx_participant_user_active` (user, is_active)

### scoring_method_fluent
- `idx_scoring_active_order` (is_active, order)
- `idx_scoring_default` (is_default, is_active)

### scoring_value_fluent
- `idx_value_method_order` (scoring_method, order)
- `idx_value_method_value` (scoring_method, value) **UNIQUE**

### session_voter_groups_fluent
- `idx_voter_group_session` (session, is_active)
- `idx_voter_group_unique` (session, group) **UNIQUE**

## Data Flow Patterns

### Session Creation Flow
```
1. User creates planning_session_fluent
2. System sets default scoring_method (T-shirt sizing)
3. System creates session_participant_fluent (dealer role)
4. User adds session_stories_fluent
5. Session status: pending → active
```

### Voting Flow
```
1. Dealer sets current_story
2. Story status: pending → voting
3. Participants create planning_vote_fluent records
4. Dealer triggers reveal
5. Story status: voting → revealed
6. System calculates statistics (avg, min, max, consensus)
7. Dealer sets final_score
8. Story status: revealed → completed
9. System auto-advances to next story
```

### Summary Field Updates
```
planning_vote INSERT/UPDATE → triggers:
  ├─ session_stories.vote_count++
  └─ planning_session.total_votes++

session_stories.status CHANGE → triggers:
  ├─ planning_session.stories_completed++ (if completed)
  ├─ planning_session.stories_skipped++ (if skipped)
  └─ Check if all stories done → auto-complete session
```

## Calculated Fields (Read-Only)

These fields are maintained automatically by business rules:

**planning_session_fluent**:
- `total_stories`: COUNT(session_stories)
- `stories_completed`: COUNT(session_stories WHERE status='completed')
- `stories_skipped`: COUNT(session_stories WHERE status='skipped')
- `total_votes`: COUNT(planning_vote WHERE is_current=true)

**session_stories_fluent**:
- `vote_count`: COUNT(planning_vote WHERE is_current=true)
- `times_revoted`: MAX(vote_sequence) - 1
- `average_score`: AVG(numeric_value) for numeric methods
- `min_score`: MIN(vote_value)
- `max_score`: MAX(vote_value)
- `consensus_reached`: All current votes have same value

## Design Decisions

### No Task Inheritance
**Decision**: Don't extend Task table
**Rationale**:
- Avoid unnecessary Task overhead (assignment, approvals, workflow)
- Cleaner data model specific to Planning Poker
- Better performance (fewer joins, smaller table)
- Fluent queries optimized for specific use case

### T-Shirt Sizing Default
**Decision**: Make T-shirt sizing the default method
**Rationale**:
- More intuitive for non-technical stakeholders
- Better for relative sizing discussions
- Avoids false precision of numeric values
- Widely adopted in Agile teams
- Easy to understand: XS, S, M, L, XL, XXL

### Vote Versioning
**Decision**: Use `vote_sequence` and `is_current` flags
**Rationale**:
- Preserve vote history when stories are re-voted
- Support analytics on voting patterns
- Enable "undo" functionality
- Track consensus improvement over re-votes

### Composite Indexes
**Decision**: Create multi-column indexes matching Fluent query patterns
**Rationale**:
- GlideQuery benefits from indexes covering WHERE + ORDER BY
- Reduce query execution time by 30-60%
- Support common access patterns (dealer dashboard, participant views)

### Summary Fields
**Decision**: Maintain calculated fields rather than compute on-the-fly
**Rationale**:
- Avoid expensive COUNT/SUM queries on every page load
- Enable fast sorting and filtering by counts
- Trade-off: Slight complexity in business rules for major performance gain

## External References

- **sys_user**: ServiceNow user table (dealer, voter, participants)
- **sys_user_group**: ServiceNow group table (voter groups)
- **rm_story**: Agile Development story table (optional reference)

---

**Generated**: Phase 0 - Setup & Infrastructure
**Last Updated**: 2025-10-31
