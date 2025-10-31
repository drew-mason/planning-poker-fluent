/**
 * ServiceNow SDK Configuration
 *
 * This file configures the ServiceNow CLI for the Fluent Planning Poker application.
 * 
 * Current Instance: dev353895.service-now.com (Zurich Release)
 * CLI Status: Authorized and working (v1.1.2)
 * Last Updated: October 31, 2025
 * 
 * See: https://developer.servicenow.com/dev.do#!/reference/cli/latest
 */

require('dotenv').config();

module.exports = {
  /**
   * Application metadata
   */
  app: {
    name: 'Planning Poker - Fluent',
    scope: process.env.SN_SCOPE || 'x_902080_msmplnpkr_fluent',
    version: '0.1.0',
    description: 'Agile story estimation using Fluent language patterns'
  },

  /**
   * Instance configuration
   */
  instance: {
    host: process.env.SN_INSTANCE || 'dev353895.service-now.com',
    protocol: 'https',

    // Authentication
    auth: {
      username: process.env.SN_USERNAME,
      password: process.env.SN_PASSWORD,
      // OAuth alternative
      clientId: process.env.SN_CLIENT_ID,
      clientSecret: process.env.SN_CLIENT_SECRET
    }
  },

  /**
   * Source directory mappings
   */
  paths: {
    tables: './Planning Poker Fluent/src/tables',
    server: './Planning Poker Fluent/src/server',
    client: './Planning Poker Fluent/src/client',
    tests: './Planning Poker Fluent/src/tests',
    scripts: './scripts'
  },

  /**
   * Sync configuration
   */
  sync: {
    autoSync: false,
    include: [
      'Planning Poker Fluent/src/tables/**/*.json',
      'Planning Poker Fluent/src/server/**/*.js',
      'Planning Poker Fluent/src/client/**/*.js'
    ],
    exclude: [
      '**/*.test.js',
      '**/*.spec.js',
      '**/node_modules/**',
      '**/.git/**'
    ]
  },

  /**
   * Deployment targets
   */
  targets: {
    dev: {
      host: 'dev353895.service-now.com',
      scope: 'x_902080_msmplnpkr_fluent'
    },
    test: {
      host: process.env.SN_TEST_INSTANCE,
      scope: 'x_902080_msmplnpkr_fluent'
    },
    prod: {
      host: process.env.SN_PROD_INSTANCE,
      scope: 'x_902080_msmplnpkr_fluent'
    }
  },

  /**
   * Build configuration
   */
  build: {
    lint: true,
    test: true,
    minify: false,
    sourceMap: true
  },

  /**
   * Feature flags
   */
  features: {
    comparisonTests: process.env.ENABLE_COMPARISON_TESTS === 'true',
    performanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
    legacyScope: process.env.LEGACY_SCOPE || 'x_902080_msmplnpkr'
  },

  /**
   * Fluent-specific settings
   */
  fluent: {
    enableOptimizations: true,
    queryTimeout: 30000,
    batchSize: 1000,
    cacheEnabled: true
  }
};
