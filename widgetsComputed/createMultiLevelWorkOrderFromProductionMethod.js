return async function (data) {
  $setGlobalModel('creatingWorkOrder', true);

  try {
    console.log('data:', data);
    let method = data.productionMethod;
    if (!method) {
      alert('No production method selected.');
      $setGlobalModel('creatingWorkOrder', false);
      return;
    }

    console.log('Production method is:', method);

    // Retrieve operations and materials
    let ops = $getGrid('methodOperations').filter(row => row.productionMethod === method);
    let mats = $getGrid('methodMaterials').filter(row => row.productionMethod === method);

    console.log('Operations:', ops);
    console.log('Materials:', mats);

    // Generate base work order name using shared model
    let workOrderIndex = $getSharedModel('workOrderIndex') || 30000;
    let baseWorkOrderName = `WO${workOrderIndex}`;
    $setSharedModel('workOrderIndex', workOrderIndex + 1);

    console.log('Base work order name:', baseWorkOrderName);

    // Create the base work order
    let newWorkOrder = await $dgAddRow('opportunityLines', {
      name: baseWorkOrderName,
    });

    await $dgSetRowVals('opportunityLines', newWorkOrder, {
      stage: '-NZaTKczYyF8kPTfQbwP',
      workOrder: data.rowKey,
      salesLine: data.rowKey,
      open: true,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Helper functions
    const processMaterialsAndOperations = async (workOrder, materials, parentWorkOrderName, subIndexMap) => {
      let subWorkOrders = [];

      for (let m of materials) {
        let matsName = `${m.name}`;
        let newMat = await $dgAddRow('workOrderMaterials', {
          workOrder,
        });

        await $dgSetRowVals('workOrderMaterials', newMat, {
          name: matsName,
          sourceMethodMaterial: m.rowKey,
        });

        // Check for sub-methods
        let subMaterials = $getGrid('methodMaterials').filter(row => row.parentPart === m.part);
        let subOperations = $getGrid('methodOperations').filter(row => row.parentPart === m.part);

        if (subMaterials.length > 0 || subOperations.length > 0) {
          // Generate sub-work order name
          if (!subIndexMap[parentWorkOrderName]) {
            subIndexMap[parentWorkOrderName] = 1;
          }

          let subWorkOrderName = `${parentWorkOrderName}.${String(subIndexMap[parentWorkOrderName]).padStart(2, '0')}`;
          subIndexMap[parentWorkOrderName]++;

          let subWorkOrder = await $dgAddRow('opportunityLines', {
            name: subWorkOrderName,
          });

          await $dgSetRowVals('opportunityLines', subWorkOrder, {
            stage: '-NZaTKczYyF8kPTfQbwP',
            mainWorkOrder: workOrder,
            part: m.part,
          });

          subWorkOrders.push({
            workOrder: subWorkOrder,
            materials: subMaterials,
            operations: subOperations,
            parentWorkOrderName: subWorkOrderName,
          });
        }
      }

      return subWorkOrders;
    };

    const processOperations = async (workOrder, operations) => {
      for (let o of operations) {
        let opName = `${o.sequence}-${o.name}`;
        let newOp = await $dgAddRow('workOrderOperations', {
          workOrder,
        });

        await $dgSetRowVals('workOrderOperations', newOp, {
          sequence: o.sequence,
          name: opName,
          sourceMethodOperation: o.rowKey,
          estProductionHours: o.estimatedProductionHours,
        });
      }
    };

    // Initial processing for the base work order
    let subIndexMap = {}; // To track sub-work order indices for consistent hierarchical naming
    let subWorkOrders = await processMaterialsAndOperations(newWorkOrder, mats, baseWorkOrderName, subIndexMap);

    await processOperations(newWorkOrder, ops);

    // Recursive processing for sub-level work orders
    while (subWorkOrders.length > 0) {
      let currentLevel = subWorkOrders.shift();

      let newSubWorkOrders = await processMaterialsAndOperations(
        currentLevel.workOrder,
        currentLevel.materials,
        currentLevel.parentWorkOrderName,
        subIndexMap
      );
      subWorkOrders.push(...newSubWorkOrders);
      await processOperations(currentLevel.workOrder, currentLevel.operations);
    }

    // Open the base work order in edit mode
    $dgShowEditRowModal('opportunityLines', newWorkOrder);

    alert('Work order creation completed!');
    $setGlobalModel('creatingWorkOrder', false);
  } catch (error) {
    console.error('Error caught:', error);
    alert('An error occurred while creating the work order.');
    $setGlobalModel('creatingWorkOrder', false);
  }
};

