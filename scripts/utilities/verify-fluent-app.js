#!/usr/bin/env node

/**
 * Fluent Application Verification Script
 * 
 * This script validates that the current directory contains a properly structured
 * ServiceNow Fluent Application that should be recognizable by ServiceNow.
 * 
 * As per Fluent Expert analysis.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('\n🔍 FLUENT APPLICATION VERIFICATION\n'));

let passed = 0;
let failed = 0;

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(chalk.green(`✓ ${description}: ${filePath}`));
    passed++;
    return true;
  } else {
    console.log(chalk.red(`✗ ${description}: ${filePath} (missing)`));
    failed++;
    return false;
  }
}

function checkJsonFile(filePath, description, requiredKeys = []) {
  if (checkFile(filePath, description)) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      for (const key of requiredKeys) {
        if (!(key in content)) {
          console.log(chalk.yellow(`  ⚠ Missing key: ${key}`));
        } else {
          console.log(chalk.gray(`    ✓ Has key: ${key}`));
        }
      }
      
      return content;
    } catch (error) {
      console.log(chalk.red(`  ✗ Invalid JSON: ${error.message}`));
      failed++;
      return null;
    }
  }
  return null;
}

// Check core fluent application markers
console.log(chalk.bold('📁 Core Fluent Application Files:'));
const fluentAppJson = checkJsonFile('fluent.app.json', 'Fluent App Metadata', ['_type', 'fluent', 'metadata']);
const appConfigJson = checkJsonFile('app.config.json', 'App Configuration', ['_type', 'name', 'scope']);
checkFile('.fluent', 'Fluent Environment Config');
checkFile('fluent.manifest', 'Fluent Manifest');
checkFile('fluent.app.js', 'Fluent App Entry Point');

// Check ServiceNow application files
console.log(chalk.bold('\n📄 ServiceNow Application Files:'));
checkFile('sys_app.xml', 'ServiceNow App Record');
checkFile('manifest.json', 'Application Manifest');
checkFile('sn.config.js', 'ServiceNow SDK Config');

// Check fluent documentation
console.log(chalk.bold('\n📚 Fluent Documentation:'));
checkFile('FLUENT_README.md', 'Fluent App Documentation');
checkFile('SERVICENOW_APP.md', 'ServiceNow App Documentation');

// Check table definitions
console.log(chalk.bold('\n🗃️ Fluent Table Definitions:'));
const tableDir = 'src/tables';
if (fs.existsSync(tableDir)) {
  const tables = fs.readdirSync(tableDir).filter(f => f.endsWith('.json'));
  console.log(chalk.green(`✓ Found ${tables.length} table definitions`));
  
  tables.forEach(table => {
    const tablePath = path.join(tableDir, table);
    const tableData = checkJsonFile(tablePath, `Table: ${table}`, ['name', 'label']);
    
    if (tableData && tableData.name) {
      if (tableData.name.includes('x_902080_msmplnpkr_fluent')) {
        console.log(chalk.gray(`    ✓ Correct scope prefix: ${tableData.name}`));
      } else {
        console.log(chalk.yellow(`    ⚠ Missing scope prefix: ${tableData.name}`));
      }
    }
  });
} else {
  console.log(chalk.red('✗ Table definitions directory missing: src/tables'));
  failed++;
}

// Check FluentQueryHelper
console.log(chalk.bold('\n🔧 Fluent Script Includes:'));
checkFile('src/server/script-includes/helpers/FluentQueryHelper.script.js', 'FluentQueryHelper');

// Validate fluent application type markers
console.log(chalk.bold('\n🏷️ Fluent Type Markers:'));
if (fluentAppJson && fluentAppJson._type === 'fluent_application') {
  console.log(chalk.green('✓ fluent.app.json has _type: "fluent_application"'));
  passed++;
} else {
  console.log(chalk.red('✗ fluent.app.json missing _type: "fluent_application"'));
  failed++;
}

if (appConfigJson && appConfigJson._type === 'fluent_application') {
  console.log(chalk.green('✓ app.config.json has _type: "fluent_application"'));
  passed++;
} else {
  console.log(chalk.red('✗ app.config.json missing _type: "fluent_application"'));
  failed++;
}

// Check fluent environment config
if (fs.existsSync('.fluent')) {
  const fluentEnv = fs.readFileSync('.fluent', 'utf8');
  if (fluentEnv.includes('FLUENT_APPLICATION=true')) {
    console.log(chalk.green('✓ .fluent contains FLUENT_APPLICATION=true'));
    passed++;
  } else {
    console.log(chalk.red('✗ .fluent missing FLUENT_APPLICATION=true'));
    failed++;
  }
}

// Final summary
console.log(chalk.bold('\n📊 VERIFICATION SUMMARY:'));
console.log(chalk.green(`✓ Passed: ${passed}`));
console.log(chalk.red(`✗ Failed: ${failed}`));

if (failed === 0) {
  console.log(chalk.green.bold('\n🎉 FLUENT APPLICATION VERIFIED!'));
  console.log(chalk.green('This repository should be recognized by ServiceNow as a fluent application.'));
  console.log(chalk.gray('Files provide multiple identification methods for ServiceNow detection.'));
} else {
  console.log(chalk.red.bold('\n❌ FLUENT APPLICATION VERIFICATION FAILED!'));
  console.log(chalk.red(`${failed} issues found that may prevent ServiceNow recognition.`));
}

console.log(chalk.blue('\n--- Fluent Expert Verification Complete ---\n'));

process.exit(failed === 0 ? 0 : 1);