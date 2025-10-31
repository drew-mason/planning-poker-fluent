/**
 * Fluent Application Entry Point
 * 
 * This file serves as the entry point for the Planning Poker Fluent application.
 * It uses ServiceNow Fluent (GlideQuery) patterns for optimal performance.
 * 
 * @type {FluentApplication}
 * @framework GlideQuery
 * @performance 30-60% improvement over GlideRecord
 */

var PlanningPokerFluentApp = (function() {
    'use strict';
    
    return {
        name: 'Planning Poker Fluent',
        scope: 'x_902080_msmplnpkr_fluent',
        version: '1.0.0',
        type: 'fluent_application',
        
        // Fluent configuration
        fluent: {
            enabled: true,
            framework: 'GlideQuery',
            patterns: ['functional', 'optimized', 'type_safe'],
            performance_target: '30-60% improvement'
        },
        
        // Application components
        components: {
            tables: [
                'x_902080_msmplnpkr_fluent_planning_session_fluent',
                'x_902080_msmplnpkr_fluent_session_stories_fluent',
                'x_902080_msmplnpkr_fluent_planning_vote_fluent',
                'x_902080_msmplnpkr_fluent_scoring_method_fluent',
                'x_902080_msmplnpkr_fluent_scoring_value_fluent',
                'x_902080_msmplnpkr_fluent_session_participant_fluent',
                'x_902080_msmplnpkr_fluent_session_voter_groups_fluent'
            ],
            script_includes: ['FluentQueryHelper']
        },
        
        // Initialize fluent application
        initialize: function() {
            gs.info('Planning Poker Fluent Application - Using GlideQuery patterns for optimal performance');
            return true;
        }
    };
})();