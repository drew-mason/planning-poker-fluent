/**
 * Seed Data Setup Script
 *
 * Creates initial scoring methods and values for Planning Poker Fluent.
 * Run this in ServiceNow Background Scripts after table creation.
 *
 * DEFAULT METHOD: T-Shirt Sizing
 */

(function seedPlanningPokerData() {
  var SCOPE = 'x_902080_msmplnpkr_fluent';

  gs.info('[Seed Data] Starting data setup for Planning Poker Fluent...');

  // Define scoring methods with T-shirt sizing as default
  var scoringMethods = [
    {
      name: 'T-Shirt Sizes',
      description: 'Simple relative sizing using t-shirt sizes (XS to XXL)',
      is_default: true,  // DEFAULT METHOD
      is_numeric: false,
      order: 1,
      values: [
        { value: 'XS', order: 1, is_special: false, description: 'Extra Small - Trivial task' },
        { value: 'S', order: 2, is_special: false, description: 'Small - Simple task' },
        { value: 'M', order: 3, is_special: false, description: 'Medium - Moderate complexity' },
        { value: 'L', order: 4, is_special: false, description: 'Large - Complex task' },
        { value: 'XL', order: 5, is_special: false, description: 'Extra Large - Very complex' },
        { value: 'XXL', order: 6, is_special: false, description: 'Double Extra Large - Should be split' },
        { value: '?', order: 7, is_special: true, description: 'Unknown - Need more information' },
        { value: 'Coffee', order: 8, is_special: true, description: 'Need a break' }
      ]
    },
    {
      name: 'Fibonacci Sequence',
      description: 'Classic Fibonacci numbers (1, 2, 3, 5, 8, 13, 21)',
      is_default: false,
      is_numeric: true,
      order: 2,
      values: [
        { value: '0', numeric_value: 0, order: 1, is_special: false, description: 'No effort' },
        { value: '1', numeric_value: 1, order: 2, is_special: false, description: 'Minimal effort' },
        { value: '2', numeric_value: 2, order: 3, is_special: false, description: 'Small effort' },
        { value: '3', numeric_value: 3, order: 4, is_special: false, description: 'Moderate effort' },
        { value: '5', numeric_value: 5, order: 5, is_special: false, description: 'Significant effort' },
        { value: '8', numeric_value: 8, order: 6, is_special: false, description: 'Large effort' },
        { value: '13', numeric_value: 13, order: 7, is_special: false, description: 'Very large effort' },
        { value: '21', numeric_value: 21, order: 8, is_special: false, description: 'Huge - consider splitting' },
        { value: '?', order: 9, is_special: true, description: 'Unknown - Need more information' },
        { value: 'Coffee', order: 10, is_special: true, description: 'Need a break' }
      ]
    },
    {
      name: 'Modified Fibonacci',
      description: 'Modified Fibonacci with half values (0.5, 1, 2, 3, 5, 8, 13, 20, 40)',
      is_default: false,
      is_numeric: true,
      order: 3,
      values: [
        { value: '0', numeric_value: 0, order: 1, is_special: false, description: 'No effort' },
        { value: '0.5', numeric_value: 0.5, order: 2, is_special: false, description: 'Trivial' },
        { value: '1', numeric_value: 1, order: 3, is_special: false, description: 'Minimal effort' },
        { value: '2', numeric_value: 2, order: 4, is_special: false, description: 'Small effort' },
        { value: '3', numeric_value: 3, order: 5, is_special: false, description: 'Moderate effort' },
        { value: '5', numeric_value: 5, order: 6, is_special: false, description: 'Significant effort' },
        { value: '8', numeric_value: 8, order: 7, is_special: false, description: 'Large effort' },
        { value: '13', numeric_value: 13, order: 8, is_special: false, description: 'Very large effort' },
        { value: '20', numeric_value: 20, order: 9, is_special: false, description: 'Huge effort' },
        { value: '40', numeric_value: 40, order: 10, is_special: false, description: 'Epic - must split' },
        { value: '?', order: 11, is_special: true, description: 'Unknown - Need more information' },
        { value: 'Coffee', order: 12, is_special: true, description: 'Need a break' }
      ]
    },
    {
      name: 'Powers of 2',
      description: 'Binary progression (1, 2, 4, 8, 16, 32)',
      is_default: false,
      is_numeric: true,
      order: 4,
      values: [
        { value: '1', numeric_value: 1, order: 1, is_special: false, description: 'Minimal effort' },
        { value: '2', numeric_value: 2, order: 2, is_special: false, description: 'Small effort' },
        { value: '4', numeric_value: 4, order: 3, is_special: false, description: 'Moderate effort' },
        { value: '8', numeric_value: 8, order: 4, is_special: false, description: 'Significant effort' },
        { value: '16', numeric_value: 16, order: 5, is_special: false, description: 'Large effort' },
        { value: '32', numeric_value: 32, order: 6, is_special: false, description: 'Very large - consider splitting' },
        { value: '?', order: 7, is_special: true, description: 'Unknown - Need more information' },
        { value: 'Coffee', order: 8, is_special: true, description: 'Need a break' }
      ]
    }
  ];

  var methodCount = 0;
  var valueCount = 0;

  // Create scoring methods and their values
  for (var i = 0; i < scoringMethods.length; i++) {
    var methodDef = scoringMethods[i];

    // Check if method already exists
    var existingMethod = new GlideQuery(SCOPE + '_scoring_method')
      .where('name', methodDef.name)
      .selectOne('sys_id')
      .orElse(null);

    if (existingMethod) {
      gs.info('[Seed Data] Scoring method "' + methodDef.name + '" already exists, skipping...');
      continue;
    }

    // Create scoring method
    var methodGr = new GlideRecord(SCOPE + '_scoring_method');
    methodGr.initialize();
    methodGr.setValue('name', methodDef.name);
    methodGr.setValue('description', methodDef.description);
    methodGr.setValue('is_default', methodDef.is_default);
    methodGr.setValue('is_numeric', methodDef.is_numeric);
    methodGr.setValue('is_active', true);
    methodGr.setValue('order', methodDef.order);
    var methodSysId = methodGr.insert();

    if (methodSysId) {
      methodCount++;
      gs.info('[Seed Data] Created scoring method: ' + methodDef.name +
              (methodDef.is_default ? ' (DEFAULT)' : ''));

      // Create scoring values for this method
      for (var j = 0; j < methodDef.values.length; j++) {
        var valueDef = methodDef.values[j];

        var valueGr = new GlideRecord(SCOPE + '_scoring_value');
        valueGr.initialize();
        valueGr.setValue('scoring_method', methodSysId);
        valueGr.setValue('value', valueDef.value);
        valueGr.setValue('order', valueDef.order);
        valueGr.setValue('is_special', valueDef.is_special);
        valueGr.setValue('description', valueDef.description);

        if (valueDef.numeric_value !== undefined) {
          valueGr.setValue('numeric_value', valueDef.numeric_value);
        }

        var valueSysId = valueGr.insert();
        if (valueSysId) {
          valueCount++;
        }
      }
    }
  }

  gs.info('[Seed Data] Completed! Created ' + methodCount + ' scoring methods and ' +
          valueCount + ' scoring values.');
  gs.info('[Seed Data] Default method: T-Shirt Sizes');

  return {
    success: true,
    methods_created: methodCount,
    values_created: valueCount
  };
})();
