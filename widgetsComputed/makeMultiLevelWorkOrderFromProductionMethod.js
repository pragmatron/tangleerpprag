return async function (data) {
  console.log('Function called with data:', data);
  $setGlobalModel('makeMultiLevelWorkOrderWithMethod', true);

  try {
    // Validate that a production method is selected
    let method = data.productionMethod;
    if (!method) {
      alert('No production method selected.');
      $setGlobalModel('makeMultiLevelWorkOrderWithMethod', false);
      return;
    }

    console.log('Selected Production Method:', method);

    // Fetch method operations and materials
    let operations = $getGrid('methodOperations').filter(row => row.productionMethod === method);
    let materials = $getGrid('methodMaterials').filter(row => row.productionMethod === method);

    console.log('Filtered Operations:', operations);
    console.log('Filtered Materials:', materials);

    // Function to process materials and recursively handle sub-levels
    const processMaterialsAndOperations = async (workOrder, materials, levelIndex = 1) => {
      let subWorkOrders = [];

      for (let mat of materials) {
        console.log('Processing material:', mat);

        // Create work order material
        let newMat = await $dgAddRow('workOrderMaterials', {
          workOrder,
        });

        await $dgSetRowVals('workOrderMaterials', newMat, {
          name: `${mat.name}`,
          sourceMethodMaterial: mat.rowKey,
          quantityRequired: mat.quantityPer || 0,
          part: mat.part || null,
          materialSequence: mat.sequence || null,
        });

        // Check for sub-level materials and operations
        let subMaterials = $getGrid('methodMaterials').filter(row => row.parentPart === mat.part);
        let subOperations = $getGrid('methodOperations').filter(row => row.parentPart === mat.part);

        if (subMaterials.length > 0 || subOperations.length > 0) {
          let subWorkOrderName = `${data.name}.${String(levelIndex).padStart(2, '0')}`;
          console.log('Creating sub-work order:', subWorkOrderName);

          let subWorkOrder = await $dgAddRow('opportunityLines', {
            name: subWorkOrderName,
          });

          await $dgSetRowVals('opportunityLines', subWorkOrder, {
            stage: '-NZaTKczYyF8kPTfQbwP',
            mainWorkOrder: workOrder,
            part: mat.part,
          });

          subWorkOrders.push({
            workOrder: subWorkOrder,
            materials: subMaterials,
            operations: subOperations,
            levelIndex: levelIndex + 1,
          });
        }

        levelIndex++;
      }

      return subWorkOrders;
    };

    // Function to process operations for a given work order
    const processOperations = async (workOrder, operations) => {
      for (let op of operations) {
        console.log('Processing operation:', op);

        // Create work order operation
        let newOp = await $dgAddRow('workOrderOperations', {
          workOrder,
        });

        await $dgSetRowVals('workOrderOperations', newOp, {
          name: `${op.sequence || ''} - ${op.name}`,
          sourceMethodOperation: op.rowKey,
          sequence: op.sequence || null,
          part: op.parentPart || null,
          estProductionHours: op.estimatedProductionHours || null,
        });
      }
    };

    // Initial processing for the base work order
    let subWorkOrders = await processMaterialsAndOperations(data.rowKey, materials);

    await processOperations(data.rowKey, operations);

    // Recursive processing for sub-level work orders
    while (subWorkOrders.length > 0) {
      let currentLevel = subWorkOrders.shift();

      await processMaterialsAndOperations(currentLevel.workOrder, currentLevel.materials, currentLevel.levelIndex);
      await processOperations(currentLevel.workOrder, currentLevel.operations);
    }

    console.log('Multi-level work order creation completed successfully.');
    alert('Work order and all sub-levels created successfully.');
    $setGlobalModel('makeMultiLevelWorkOrderWithMethod', false);
  } catch (error) {
    console.error('Error caught while creating multi-level work order:', error);
    alert('An error occurred while creating the work order.');
    $setGlobalModel('makeMultiLevelWorkOrderWithMethod', false);
  }
};
