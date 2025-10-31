/* global GlideQuery, gs */

/**
 * FluentQueryHelper - Reusable Fluent (GlideQuery) database operations
 *
 * Provides safe, functional patterns for database operations using ServiceNow's
 * modern GlideQuery API. All methods include error handling and null safety.
 *
 * @class FluentQueryHelper
 * @namespace x_902080_msmplnpkr_fluent
 */
var FluentQueryHelper = Class.create();

FluentQueryHelper.prototype = {

  /**
   * Initialize the FluentQueryHelper
   * @constructor
   */
  initialize: function() {
    this.LOG_PREFIX = '[FluentQueryHelper]';
  },

  /**
   * Safely retrieve a single record by sys_id with null handling
   *
   * @param {string} table - Table name to query
   * @param {string} sysId - Record sys_id to retrieve
   * @param {Array<string>} fields - Fields to select (empty array = all fields)
   * @returns {Object|null} Record object or null if not found
   *
   * @example
   * var helper = new FluentQueryHelper();
   * var session = helper.getSafe('x_902080_msmplnpkr_fluent_planning_session_fluent', sessionId, ['session_code', 'status', 'dealer']);
   * if (session) {
   *   gs.info('Session code: ' + session.session_code);
   * }
   */
  getSafe: function(table, sysId, fields) {
    fields = fields || [];

    try {
      if (!table || !sysId) {
        gs.warn(this.LOG_PREFIX + ' getSafe called with missing table or sysId');
        return null;
      }

      var query = new GlideQuery(table).get(sysId);

      if (fields.length > 0) {
        query = query.select.apply(query, fields);
      }

      return query.orElse(null);

    } catch (error) {
      gs.error(this.LOG_PREFIX + ' Error in getSafe: ' + error.message + ' (table: ' + table + ', sysId: ' + sysId + ')');
      return null;
    }
  },

  /**
   * Check if a record exists matching the given criteria
   *
   * @param {string} table - Table name to query
   * @param {string} field - Field name to check
   * @param {string|number} value - Value to match
   * @returns {boolean} True if record exists, false otherwise
   *
   * @example
   * var helper = new FluentQueryHelper();
   * var codeExists = helper.exists('x_902080_msmplnpkr_fluent_planning_session_fluent', 'session_code', 'ABC123');
   */
  exists: function(table, field, value) {
    try {
      if (!table || !field) {
        gs.warn(this.LOG_PREFIX + ' exists called with missing table or field');
        return false;
      }

      var count = new GlideQuery(table)
        .where(field, value)
        .selectOne('sys_id')
        .orElse(null);

      return count !== null;

    } catch (error) {
      gs.error(this.LOG_PREFIX + ' Error in exists: ' + error.message);
      return false;
    }
  },

  /**
   * Build a filtered query with optional field selection
   * Returns an array of results (functional pattern)
   *
   * @param {string} table - Table name to query
   * @param {Object} filters - Filter object where keys are field names
   * @param {Array<string>} fields - Fields to select (empty = all fields)
   * @returns {Array<Object>} Array of record objects
   *
   * @example
   * var helper = new FluentQueryHelper();
   * var activeStories = helper.query(
   *   'x_902080_msmplnpkr_fluent_session_stories_fluent',
   *   { session: sessionId, status: 'voting' },
   *   ['sys_id', 'story_name', 'vote_count']
   * );
   */
  query: function(table, filters, fields) {
    filters = filters || {};
    fields = fields || [];

    try {
      if (!table) {
        gs.warn(this.LOG_PREFIX + ' query called with missing table');
        return [];
      }

      var query = new GlideQuery(table);

      // Apply filters
      var filterKeys = Object.keys(filters);
      for (var i = 0; i < filterKeys.length; i++) {
        var key = filterKeys[i];
        var value = filters[key];
        query = query.where(key, value);
      }

      // Apply field selection
      if (fields.length > 0) {
        query = query.select.apply(query, fields);
      }

      // Convert to array
      var results = [];
      query.forEach(function(record) {
        results.push(record);
      });

      return results;

    } catch (error) {
      gs.error(this.LOG_PREFIX + ' Error in query: ' + error.message);
      return [];
    }
  },

  /**
   * Safely insert a new record with error handling
   *
   * @param {string} table - Table name
   * @param {Object} data - Field values to insert
   * @returns {Object} Result object {success: boolean, sysId: string|null, error: string|null}
   *
   * @example
   * var helper = new FluentQueryHelper();
   * var result = helper.insertSafe('x_902080_msmplnpkr_fluent_planning_vote_fluent', {
   *   session: sessionId,
   *   story: storyId,
   *   voter: gs.getUserID(),
   *   vote_value: '5'
   * });
   * if (result.success) {
   *   gs.info('Vote created: ' + result.sysId);
   * }
   */
  insertSafe: function(table, data) {
    try {
      if (!table || !data) {
        return {
          success: false,
          sysId: null,
          error: 'Missing table or data'
        };
      }

      var result = new GlideQuery(table)
        .insert(data)
        .orElseThrow();

      return {
        success: true,
        sysId: result.sys_id,
        error: null
      };

    } catch (error) {
      gs.error(this.LOG_PREFIX + ' Error in insertSafe: ' + error.message + ' (table: ' + table + ')');
      return {
        success: false,
        sysId: null,
        error: error.message
      };
    }
  },

  /**
   * Safely update a record by sys_id with validation
   *
   * @param {string} table - Table name
   * @param {string} sysId - Record sys_id to update
   * @param {Object} data - Field values to update
   * @returns {Object} Result object {success: boolean, error: string|null}
   *
   * @example
   * var helper = new FluentQueryHelper();
   * var result = helper.updateSafe('x_902080_msmplnpkr_fluent_session_stories_fluent', storyId, {
   *   status: 'completed',
   *   final_estimate: '5'
   * });
   */
  updateSafe: function(table, sysId, data) {
    try {
      if (!table || !sysId || !data) {
        return {
          success: false,
          error: 'Missing table, sysId, or data'
        };
      }

      // Verify record exists first
      var exists = new GlideQuery(table)
        .get(sysId)
        .selectOne('sys_id')
        .isPresent();

      if (!exists) {
        return {
          success: false,
          error: 'Record not found: ' + sysId
        };
      }

      new GlideQuery(table)
        .get(sysId)
        .update(data)
        .orElseThrow();

      return {
        success: true,
        error: null
      };

    } catch (error) {
      gs.error(this.LOG_PREFIX + ' Error in updateSafe: ' + error.message + ' (table: ' + table + ', sysId: ' + sysId + ')');
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Safely delete a record by sys_id
   *
   * @param {string} table - Table name
   * @param {string} sysId - Record sys_id to delete
   * @returns {Object} Result object {success: boolean, error: string|null}
   *
   * @example
   * var helper = new FluentQueryHelper();
   * var result = helper.deleteSafe('x_902080_msmplnpkr_fluent_planning_vote_fluent', voteId);
   */
  deleteSafe: function(table, sysId) {
    try {
      if (!table || !sysId) {
        return {
          success: false,
          error: 'Missing table or sysId'
        };
      }

      new GlideQuery(table)
        .get(sysId)
        .deleteRecord()
        .orElseThrow();

      return {
        success: true,
        error: null
      };

    } catch (error) {
      gs.error(this.LOG_PREFIX + ' Error in deleteSafe: ' + error.message + ' (table: ' + table + ', sysId: ' + sysId + ')');
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Functional aggregation using reduce pattern
   * Queries records and applies a reducer function to accumulate results
   *
   * @param {string} table - Table name to query
   * @param {Object} filters - Filter object
   * @param {Function} reducer - Reducer function (accumulator, record) => accumulator
   * @param {*} initial - Initial accumulator value
   * @returns {*} Final accumulated value
   *
   * @example
   * // Count total votes across all stories in a session
   * var helper = new FluentQueryHelper();
   * var totalVotes = helper.aggregate(
   *   'x_902080_msmplnpkr_fluent_session_stories_fluent',
   *   { session: sessionId },
   *   function(sum, story) { return sum + (story.vote_count || 0); },
   *   0
   * );
   */
  aggregate: function(table, filters, reducer, initial) {
    try {
      if (!table || typeof reducer !== 'function') {
        gs.warn(this.LOG_PREFIX + ' aggregate called with invalid parameters');
        return initial;
      }

      var query = new GlideQuery(table);

      // Apply filters
      var filterKeys = Object.keys(filters || {});
      for (var i = 0; i < filterKeys.length; i++) {
        var key = filterKeys[i];
        var value = filters[key];
        query = query.where(key, value);
      }

      var accumulator = initial;
      query.forEach(function(record) {
        accumulator = reducer(accumulator, record);
      });

      return accumulator;

    } catch (error) {
      gs.error(this.LOG_PREFIX + ' Error in aggregate: ' + error.message);
      return initial;
    }
  },

  /**
   * Get count of records matching filters
   * Optimized for performance using aggregate
   *
   * @param {string} table - Table name
   * @param {Object} filters - Filter object
   * @returns {number} Count of matching records
   *
   * @example
   * var helper = new FluentQueryHelper();
   * var voteCount = helper.count('x_902080_msmplnpkr_fluent_planning_vote_fluent', { session: sessionId, story: storyId });
   */
  count: function(table, filters) {
    try {
      if (!table) {
        return 0;
      }

      var query = new GlideQuery(table);

      // Apply filters
      var filterKeys = Object.keys(filters || {});
      for (var i = 0; i < filterKeys.length; i++) {
        var key = filterKeys[i];
        var value = filters[key];
        query = query.where(key, value);
      }

      return query.aggregate('count').orElse(0);

    } catch (error) {
      gs.error(this.LOG_PREFIX + ' Error in count: ' + error.message);
      return 0;
    }
  },

  /**
   * Query with ordering and limit
   *
   * @param {string} table - Table name
   * @param {Object} filters - Filter object
   * @param {Array<string>} fields - Fields to select
   * @param {string} orderBy - Field to order by
   * @param {boolean} descending - Sort descending if true
   * @param {number} limit - Maximum records to return
   * @returns {Array<Object>} Array of record objects
   *
   * @example
   * var helper = new FluentQueryHelper();
   * var recentVotes = helper.queryOrdered(
   *   'x_902080_msmplnpkr_fluent_planning_vote_fluent',
   *   { session: sessionId },
   *   ['voter', 'vote_value', 'sys_created_on'],
   *   'sys_created_on',
   *   true,
   *   10
   * );
   */
  queryOrdered: function(table, filters, fields, orderBy, descending, limit) {
    filters = filters || {};
    fields = fields || [];

    try {
      if (!table) {
        return [];
      }

      var query = new GlideQuery(table);

      // Apply filters
      var filterKeys = Object.keys(filters);
      for (var i = 0; i < filterKeys.length; i++) {
        var key = filterKeys[i];
        var value = filters[key];
        query = query.where(key, value);
      }

      // Apply ordering
      if (orderBy) {
        if (descending) {
          query = query.orderByDesc(orderBy);
        } else {
          query = query.orderBy(orderBy);
        }
      }

      // Apply limit
      if (limit && limit > 0) {
        query = query.limit(limit);
      }

      // Apply field selection
      if (fields.length > 0) {
        query = query.select.apply(query, fields);
      }

      // Convert to array
      var results = [];
      query.forEach(function(record) {
        results.push(record);
      });

      return results;

    } catch (error) {
      gs.error(this.LOG_PREFIX + ' Error in queryOrdered: ' + error.message);
      return [];
    }
  },

  /**
   * Batch insert multiple records efficiently
   *
   * @param {string} table - Table name
   * @param {Array<Object>} records - Array of record data objects
   * @returns {Object} Result {success: boolean, inserted: number, errors: Array}
   *
   * @example
   * var helper = new FluentQueryHelper();
   * var result = helper.batchInsert('x_902080_msmplnpkr_fluent_scoring_value_fluent', [
   *   { scoring_method: methodId, display_value: 'XS', numeric_value: 1, sort_order: 1 },
   *   { scoring_method: methodId, display_value: 'S', numeric_value: 2, sort_order: 2 },
   *   { scoring_method: methodId, display_value: 'M', numeric_value: 3, sort_order: 3 }
   * ]);
   */
  batchInsert: function(table, records) {
    var inserted = 0;
    var errors = [];

    try {
      if (!table || !records || !Array.isArray(records)) {
        return {
          success: false,
          inserted: 0,
          errors: ['Invalid parameters']
        };
      }

      for (var i = 0; i < records.length; i++) {
        var result = this.insertSafe(table, records[i]);
        if (result.success) {
          inserted++;
        } else {
          errors.push('Record ' + i + ': ' + result.error);
        }
      }

      return {
        success: errors.length === 0,
        inserted: inserted,
        errors: errors
      };

    } catch (error) {
      gs.error(this.LOG_PREFIX + ' Error in batchInsert: ' + error.message);
      return {
        success: false,
        inserted: inserted,
        errors: [error.message]
      };
    }
  },

  type: 'FluentQueryHelper'
};
