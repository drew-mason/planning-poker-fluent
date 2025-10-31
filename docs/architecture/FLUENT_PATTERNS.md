# Fluent Language Patterns Guide

A comprehensive guide to using ServiceNow Fluent (GlideQuery) patterns in the Planning Poker application.

## Overview

Fluent is ServiceNow's modern query API that provides:
- **Chainable methods** for readable, expressive queries
- **Better performance** through query optimization
- **Type safety** with compile-time checks
- **Functional programming** patterns
- **Reduced code complexity** compared to GlideRecord

## Core Concepts

### Traditional GlideRecord vs Fluent GlideQuery

#### ❌ Legacy Pattern (GlideRecord)
```javascript
// Fetch active sessions for a dealer
var gr = new GlideRecord('x_902080_msmplnpkr_planning_session');
gr.addQuery('dealer', dealerId);
gr.addQuery('status', 'active');
gr.orderByDesc('created_on');
gr.setLimit(10);
gr.query();

var sessions = [];
while (gr.next()) {
  sessions.push({
    sys_id: gr.getValue('sys_id'),
    name: gr.getValue('name'),
    status: gr.getValue('status')
  });
}
return sessions;
```

#### ✅ Fluent Pattern (GlideQuery)
```javascript
// Same query, cleaner syntax
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('dealer', dealerId)
  .where('status', 'active')
  .orderByDesc('created_on')
  .select('sys_id', 'name', 'status')
  .limit(10)
  .toArray(10);

return sessions;
```

**Benefits**:
- 50% less code
- More readable intent
- No manual array building
- Automatic field selection
- Better performance

## Common Query Patterns

### 1. Simple Queries

#### Get Single Record
```javascript
// Get session by sys_id
var session = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('sys_id', sessionId)
  .selectOne()
  .get();

// With default fallback
var session = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('sys_id', sessionId)
  .selectOne()
  .orElse({ name: 'Not Found' });
```

#### Get Multiple Records
```javascript
// Get all active sessions
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('status', 'active')
  .select()
  .toArray(100);
```

### 2. Complex Conditions

#### Multiple WHERE Clauses (AND)
```javascript
// Active sessions for specific dealer
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('dealer', dealerId)
  .where('status', 'active')
  .where('allow_spectators', true)
  .select()
  .toArray(50);
```

#### OR Conditions
```javascript
// Sessions that are active OR pending
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('dealer', dealerId)
  .whereIn('status', ['active', 'pending'])
  .select()
  .toArray(50);
```

#### NOT Conditions
```javascript
// Sessions not completed or cancelled
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .whereNotIn('status', ['completed', 'cancelled'])
  .select()
  .toArray(50);
```

#### NULL Checks
```javascript
// Sessions with no current story
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .whereNull('current_story')
  .where('status', 'active')
  .select()
  .toArray(50);
```

### 3. Ordering and Limiting

```javascript
// Most recent sessions first
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('dealer', dealerId)
  .orderByDesc('created_on')
  .limit(10)
  .select()
  .toArray(10);

// Multiple sort criteria
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .orderBy('status')
  .orderByDesc('created_on')
  .select()
  .toArray(50);
```

### 4. Field Selection

```javascript
// Select specific fields (better performance)
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('status', 'active')
  .select('sys_id', 'name', 'dealer', 'status', 'created_on')
  .toArray(50);

// Select all fields
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('status', 'active')
  .select()
  .toArray(50);
```

### 5. Aggregations

#### Count
```javascript
// Count active sessions
var count = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('status', 'active')
  .where('dealer', dealerId)
  .count();

gs.info('Active sessions: ' + count);
```

#### Sum
```javascript
// Total votes across all sessions
var result = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('dealer', dealerId)
  .aggregate('sum', 'total_votes')
  .selectOne()
  .get();

var totalVotes = result.sum_total_votes;
```

#### Average
```javascript
// Average vote count per story
var result = new GlideQuery('x_902080_msmplnpkr_fluent_session_stories')
  .where('session', sessionId)
  .aggregate('avg', 'vote_count')
  .selectOne()
  .get();

var avgVotes = result.avg_vote_count;
```

#### Multiple Aggregations
```javascript
// Get min, max, and average
var stats = new GlideQuery('x_902080_msmplnpkr_fluent_session_stories')
  .where('session', sessionId)
  .where('status', 'completed')
  .aggregate('min', 'vote_count')
  .aggregate('max', 'vote_count')
  .aggregate('avg', 'vote_count')
  .selectOne()
  .get();

gs.info('Min: ' + stats.min_vote_count);
gs.info('Max: ' + stats.max_vote_count);
gs.info('Avg: ' + stats.avg_vote_count);
```

### 6. Joins and Related Records

#### Simple Join
```javascript
// Get sessions with scoring method details
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('status', 'active')
  .select('sys_id', 'name', 'scoring_method.name', 'scoring_method.is_numeric')
  .toArray(50);

sessions.forEach(function(session) {
  gs.info('Session: ' + session.name + ' uses ' + session['scoring_method.name']);
});
```

#### Multiple Joins
```javascript
// Get votes with story and session details
var votes = new GlideQuery('x_902080_msmplnpkr_fluent_planning_vote')
  .where('is_current', true)
  .select(
    'sys_id',
    'vote_value',
    'voter.name',
    'session_story.title',
    'session.name'
  )
  .toArray(100);
```

### 7. Iteration Patterns

#### forEach
```javascript
// Process each record
new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('status', 'active')
  .select()
  .forEach(function(session) {
    gs.info('Processing session: ' + session.name);
    // Process logic here
  });
```

#### map
```javascript
// Transform records
var sessionNames = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('dealer', dealerId)
  .select('name')
  .map(function(session) {
    return session.name;
  })
  .toArray(50);
```

#### reduce
```javascript
// Aggregate custom logic
var totalStories = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('dealer', dealerId)
  .select('total_stories')
  .reduce(function(sum, session) {
    return sum + parseInt(session.total_stories || 0, 10);
  }, 0);
```

## Planning Poker Specific Patterns

### Get Current Story for Session
```javascript
function getCurrentStory(sessionId) {
  var session = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
    .where('sys_id', sessionId)
    .selectOne('current_story')
    .get();

  if (!session || !session.current_story) {
    return null;
  }

  return new GlideQuery('x_902080_msmplnpkr_fluent_session_stories')
    .where('sys_id', session.current_story)
    .select('sys_id', 'title', 'description', 'status', 'story.short_description')
    .selectOne()
    .get();
}
```

### Get Active Participants
```javascript
function getActiveParticipants(sessionId) {
  return new GlideQuery('x_902080_msmplnpkr_fluent_session_participant')
    .where('session', sessionId)
    .where('is_active', true)
    .whereNot('role', 'spectator')
    .select('user.sys_id', 'user.name', 'user.email', 'role')
    .orderBy('role')
    .orderBy('user.name')
    .toArray(100);
}
```

### Check if User Has Voted
```javascript
function hasUserVoted(storyId, userId) {
  var count = new GlideQuery('x_902080_msmplnpkr_fluent_planning_vote')
    .where('session_story', storyId)
    .where('voter', userId)
    .where('is_current', true)
    .count();

  return count > 0;
}
```

### Get Vote Statistics
```javascript
function getVoteStatistics(storyId) {
  var votes = new GlideQuery('x_902080_msmplnpkr_fluent_planning_vote')
    .where('session_story', storyId)
    .where('is_current', true)
    .select('vote_value')
    .toArray(100);

  if (votes.length === 0) {
    return null;
  }

  var values = votes.map(function(v) { return v.vote_value; });
  var uniqueValues = values.filter(function(v, i, arr) {
    return arr.indexOf(v) === i;
  });

  return {
    total_votes: votes.length,
    unique_values: uniqueValues.length,
    consensus: uniqueValues.length === 1,
    values: values
  };
}
```

### Get Sessions Requiring Attention
```javascript
function getSessionsRequiringAttention(dealerId) {
  return new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
    .where('dealer', dealerId)
    .where('status', 'active')
    .where('current_story', '!=', '')
    .select(
      'sys_id',
      'name',
      'current_story.title',
      'current_story.vote_count',
      'current_story.status'
    )
    .orderByDesc('current_story.vote_count')
    .toArray(10);
}
```

## Performance Best Practices

### 1. Use Indexes
```javascript
// ✅ GOOD - Uses composite index
new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('dealer', dealerId)
  .where('status', 'active')
  .orderByDesc('created_on')
  .select()
  .toArray(10);

// Index: idx_session_dealer_status (dealer, status, created_on)
```

### 2. Limit Results
```javascript
// ✅ GOOD - Always use limit for large tables
new GlideQuery('x_902080_msmplnpkr_fluent_planning_vote')
  .where('session', sessionId)
  .limit(1000)
  .select()
  .toArray(1000);
```

### 3. Select Only Needed Fields
```javascript
// ❌ BAD - Fetches all fields
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('status', 'active')
  .select()
  .toArray(50);

// ✅ GOOD - Only needed fields
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('status', 'active')
  .select('sys_id', 'name', 'status')
  .toArray(50);
```

### 4. Use Aggregations Instead of Loops
```javascript
// ❌ BAD - Manual count
var votes = new GlideQuery('x_902080_msmplnpkr_fluent_planning_vote')
  .where('session_story', storyId)
  .select()
  .toArray(1000);
var count = votes.length;

// ✅ GOOD - Database aggregation
var count = new GlideQuery('x_902080_msmplnpkr_fluent_planning_vote')
  .where('session_story', storyId)
  .count();
```

### 5. Avoid N+1 Queries
```javascript
// ❌ BAD - N+1 query pattern
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .select()
  .toArray(50);

sessions.forEach(function(session) {
  var method = new GlideQuery('x_902080_msmplnpkr_fluent_scoring_method')
    .where('sys_id', session.scoring_method)
    .selectOne('name')
    .get();
  gs.info(method.name);
});

// ✅ GOOD - Single query with join
var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .select('sys_id', 'name', 'scoring_method.name')
  .toArray(50);

sessions.forEach(function(session) {
  gs.info(session['scoring_method.name']);
});
```

## Error Handling

### Check for Results
```javascript
// Using .get() with null check
var session = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('sys_id', sessionId)
  .selectOne()
  .get();

if (!session) {
  gs.error('Session not found: ' + sessionId);
  return null;
}

// Using .orElse() for default
var session = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
  .where('sys_id', sessionId)
  .selectOne()
  .orElse({ name: 'Unknown Session' });
```

### Try-Catch for Safety
```javascript
try {
  var sessions = new GlideQuery('x_902080_msmplnpkr_fluent_planning_session')
    .where('status', 'active')
    .select()
    .toArray(50);

  return sessions;
} catch (e) {
  gs.error('Error fetching sessions: ' + e.message);
  return [];
}
```

## Migration Checklist

When converting from GlideRecord to Fluent:

- [ ] Replace `new GlideRecord()` with `new GlideQuery()`
- [ ] Replace `addQuery()` with `.where()`
- [ ] Replace `query()` with `.select()`
- [ ] Replace `next()` loops with `.toArray()` or `.forEach()`
- [ ] Replace `getValue()` with direct property access
- [ ] Replace `getRowCount()` with `.count()`
- [ ] Add appropriate `.limit()` calls
- [ ] Use `.selectOne()` for single records
- [ ] Leverage joins for related data
- [ ] Test performance improvements

---

**Guide Version**: 1.0
**Last Updated**: 2025-10-31
**Next**: See [Performance Benchmark Results](../benchmark-results/)
